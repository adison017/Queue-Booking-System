import fs from "fs"
import path from "path"
import { neon } from "@neondatabase/serverless"

function loadEnvFromFile(filePath) {
  if (!fs.existsSync(filePath)) return {}
  const raw = fs.readFileSync(filePath, "utf8")
  return Object.fromEntries(
    raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const [key, ...rest] = line.split("=")
        return [key, rest.join("=")]
      })
  )
}

const env = {
  ...loadEnvFromFile(path.resolve(process.cwd(), ".env")),
  ...loadEnvFromFile(path.resolve(process.cwd(), ".env.local")),
  ...process.env,
}

const connectionString = env.DATABASE_URL
if (!connectionString) {
  console.error("ERROR: DATABASE_URL is not set. Please set it in .env.local or your environment.")
  process.exit(1)
}

const sql = neon(connectionString)

const migrationPath = path.resolve(process.cwd(), "scripts", "migrate.sql")
if (!fs.existsSync(migrationPath)) {
  console.error("ERROR: migrate.sql not found at", migrationPath)
  process.exit(1)
}

const migrationSql = fs.readFileSync(migrationPath, "utf8")

function splitSqlStatements(sqlText) {
  const statements = []
  let current = ""
  let inSingleQuote = false
  let inDoubleQuote = false
  let inDollarQuote = false
  let dollarQuoteTag = ""

  for (let i = 0; i < sqlText.length; i += 1) {
    const ch = sqlText[i]
    const nextTwo = sqlText.slice(i, i + 2)

    // Handle entering/exiting dollar-quoted string
    if (!inSingleQuote && !inDoubleQuote && nextTwo === "$$") {
      if (!inDollarQuote) {
        inDollarQuote = true
        dollarQuoteTag = "$$"
      } else if (inDollarQuote && dollarQuoteTag === "$$") {
        inDollarQuote = false
        dollarQuoteTag = ""
      }
      current += ch
      continue
    }

    if (!inSingleQuote && !inDoubleQuote && !inDollarQuote && ch === "'") {
      inSingleQuote = true
    } else if (inSingleQuote && ch === "'" && sqlText[i - 1] !== "\\") {
      inSingleQuote = false
    }

    if (!inSingleQuote && !inDoubleQuote && !inDollarQuote && ch === '"') {
      inDoubleQuote = true
    } else if (inDoubleQuote && ch === '"' && sqlText[i - 1] !== "\\") {
      inDoubleQuote = false
    }

    if (ch === ";" && !inSingleQuote && !inDoubleQuote && !inDollarQuote) {
      if (current.trim()) {
        statements.push(current.trim())
      }
      current = ""
      continue
    }

    current += ch
  }

  if (current.trim()) {
    statements.push(current.trim())
  }

  return statements
}

const statements = splitSqlStatements(migrationSql)

console.log(`Running migration script (${statements.length} statements)...`)
statements.forEach((statement, index) => {
  const trimmed = statement.trim()
  console.log(
    `#${index + 1}: ${trimmed ? trimmed.slice(0, 60).replace(/\s+/g, " ") : "<empty>"}`
  )
})

try {
  for (let i = 0; i < statements.length; i += 1) {
    const statement = statements[i]
    const trimmed = statement.trim()
    if (!trimmed || trimmed.startsWith("--")) continue

    try {
      await sql(trimmed)
    } catch (error) {
      console.error(`\nMigration failed on statement #${i + 1}:`)
      console.error(trimmed)
      console.error(error)
      process.exit(1)
    }
  }
  console.log("✅ Migration complete.")
} catch (error) {
  console.error("Migration failed:", error)
  process.exit(1)
}

// Close the connection if supported
if (typeof sql.end === "function") {
  await sql.end()
}
