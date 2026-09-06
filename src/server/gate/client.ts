import { ApiError } from '../errors'
import { gateConfig } from './config'
export async function gateRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const config = gateConfig()
  if (!config.apiKey || !config.projectId)
    throw new ApiError('Gate integration is not configured', 503)
  const response = await fetch(`${config.baseUrl}/api/v1${path}`, {
    ...options,
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
    headers: {
      'X-API-Key': config.apiKey,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!response.ok)
    throw new ApiError(
      'Gate request failed',
      response.status >= 500 ? 503 : response.status
    )
  if (response.status === 204) return undefined as T
  return ((await response.json()) as { data: T }).data
}
export const projectPath = () =>
  `/projects/${encodeURIComponent(gateConfig().projectId)}`
