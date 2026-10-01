import { ApiError } from '../errors'
import { gateConfig } from './config'

/**
 * Statuses that mean Gate rejected or could not serve *this server*: the
 * service key is wrong, unscoped or pinned to another environment, or Gate is
 * down. Passed through, a 401 would read as "sign in again" and the native
 * apps would wipe their credentials over a server misconfiguration.
 */
const UNAVAILABLE = new Set([401, 403, 408, 429])

type GateProblem = {
  type?: string
  title?: string
  detail?: string
  requestId?: string
}

async function problemOf(response: Response): Promise<GateProblem> {
  try {
    const body = (await response.json()) as GateProblem
    return typeof body === 'object' && body ? body : {}
  } catch {
    return {}
  }
}

function unavailable() {
  return new ApiError(
    'Gate is temporarily unavailable. Retry shortly.',
    503,
    'GATE_UNAVAILABLE'
  )
}

export async function gateRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const config = gateConfig()
  if (!config.apiKey || !config.projectId) {
    console.error('gate: GATE_API_KEY or GATE_PROJECT_ID is not set')
    throw new ApiError(
      'Gate integration is not configured',
      503,
      'GATE_NOT_CONFIGURED'
    )
  }
  const method = options.method ?? 'GET'
  let response: Response
  try {
    response = await fetch(`${config.baseUrl}/api/v1${path}`, {
      ...options,
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
      headers: {
        'X-API-Key': config.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
  } catch (error) {
    console.error(`gate: ${method} ${path} failed`, error)
    throw unavailable()
  }
  if (!response.ok) {
    const problem = await problemOf(response)
    // Gate's problem details are the only clue to a misconfigured key,
    // environment or plan, so they always reach the logs.
    console.error(`gate: ${method} ${path} -> ${response.status}`, {
      type: problem.type,
      title: problem.title,
      detail: problem.detail,
      requestId: problem.requestId,
    })
    if (response.status >= 500 || UNAVAILABLE.has(response.status))
      throw unavailable()
    throw new ApiError('Gate request failed', response.status)
  }
  if (response.status === 204) return undefined as T
  return ((await response.json()) as { data: T }).data
}

export const projectPath = () =>
  `/projects/${encodeURIComponent(gateConfig().projectId)}`
