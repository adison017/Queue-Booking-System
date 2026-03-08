import { NextResponse } from 'next/server'

export function successResponse<T>(data: T, statusCode = 200) {
  return NextResponse.json(data, { status: statusCode })
}

export function errorResponse(message: string, statusCode = 400) {
  return NextResponse.json({ error: message }, { status: statusCode })
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export function forbiddenResponse() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export function notFoundResponse() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export function internalErrorResponse() {
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown) {
  console.error('[v0] API error:', error)

  if (error instanceof ApiError) {
    return errorResponse(error.message, error.statusCode)
  }

  if (error instanceof SyntaxError) {
    return errorResponse('Invalid request format', 400)
  }

  return internalErrorResponse()
}
