import type {
  CallToolResult,
  ToolAnnotations,
} from '@modelcontextprotocol/server'
import { logs, SeverityNumber } from '@opentelemetry/api-logs'
import { and, eq, isNull } from 'drizzle-orm'

import type { SlugUser } from '@/utils/profile.utils'

import { getDatabase } from '../../db'
import { users } from '../../db/schema'
import { ApiError, assertFound } from '../../errors'

const logger = logs.getLogger('clippingkk.web.mcp')

/** What every tool of one MCP request shares: the reader and link building. */
export interface ToolContext {
  userId: number
  origin: string
  /** The reader, loaded once per request, for URL slugs. */
  user: () => Promise<SlugUser>
  /** An absolute link to a ClippingKK page. */
  url: (path: string) => string
}

export function toolContext(userId: number, origin: string): ToolContext {
  let user: Promise<SlugUser> | undefined
  return {
    userId,
    origin,
    user: () =>
      (user ??= getDatabase()
        .db.query.users.findFirst({
          columns: { id: true, domain: true },
          where: and(eq(users.id, userId), isNull(users.deletedAt)),
        })
        .then((row) => assertFound(row, 'user not found'))),
    url: (path) => new URL(path, origin).toString(),
  }
}

/** Every tool only reads the caller's own library. */
export const readOnly: ToolAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
}

/** Structured output for clients that read it, the same JSON as text for those that don't. */
export function result<T extends Record<string, unknown>>(
  data: T
): CallToolResult {
  return {
    content: [{ type: 'text', text: JSON.stringify(data) }],
    structuredContent: data,
  }
}

export const iso = (value: Date | string | null | undefined) =>
  value ? new Date(value).toISOString() : null

/** A problem with the caller's arguments, safe to show the model verbatim. */
export class ToolInputError extends Error {}

/** A `YYYY-MM-DD` date or full ISO timestamp, parsed as UTC. */
export function parseDate(value: string | undefined) {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime()))
    throw new ToolInputError(`Invalid date: ${value}`)
  return date
}

/**
 * Wraps a tool handler so only deliberate messages reach the client: argument
 * errors and API errors (not found, forbidden) pass through, anything else —
 * a failed query carries its SQL — is logged and replaced.
 */
export function safely<A extends unknown[]>(
  name: string,
  handler: (...args: A) => Promise<CallToolResult>
) {
  return async (...args: A): Promise<CallToolResult> => {
    try {
      return await handler(...args)
    } catch (error) {
      if (error instanceof ToolInputError || error instanceof ApiError)
        throw error
      logger.emit({
        severityNumber: SeverityNumber.ERROR,
        severityText: 'ERROR',
        body: 'mcp tool failed',
        attributes: {
          'mcp.tool': name,
          'error.message':
            error instanceof Error ? error.message : String(error),
        },
      })
      throw new Error(`${name} failed. Try again later.`, { cause: error })
    }
  }
}
