export class ApiError extends Error {
  constructor(
    message: string,
    readonly status = 400,
    readonly code = 'BAD_REQUEST'
  ) {
    super(message)
    this.name = 'ApiError'
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
