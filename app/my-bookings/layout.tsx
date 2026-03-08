import { Navbar } from "@/components/navbar"

export default function MyBookingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-10">
        {children}
      </main>
    </div>
  )
}
