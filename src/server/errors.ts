/**
 * Codes that follow from a status alone. Without this, `new ApiError('book not
 * found', 404)` reached clients as BAD_REQUEST, so a missing book rendered the
 * error boundary instead of a not-found page.
 */
const CODE_FOR_STATUS: Record<number, string> = {
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
}

export class ApiError extends Error {
  readonly code: string
  constructor(
    message: string,
    readonly status = 400,
    code?: string
  ) {
    super(message)
    this.name = 'ApiError'
    this.code = code ?? CODE_FOR_STATUS[status] ?? 'BAD_REQUEST'
  }
}

export function assertFound<T>(
  value: T | null | undefined,
  message = 'not found'
): T {
  if (value === null || value === undefined)
    throw new ApiError(message, 404, 'NOT_FOUND')
  return value
}
