import { createHash, randomBytes } from 'node:crypto'

import { and, count, desc, eq, gt, isNull, or } from 'drizzle-orm'

import { getDatabase } from '../db'
import { mcpTokens, users } from '../db/schema'
import { ApiError } from '../errors'

/**
 * Personal access tokens for the MCP server, for clients that take a static
 * `Authorization` header instead of running OAuth. The plaintext is shown once
 * at creation; only its sha256 is stored, so a database dump holds nothing a
 * client could present.
 */
export const MCP_TOKEN_PREFIX = 'ck_mcp_'
const MCP_TOKEN = /^ck_mcp_[A-Za-z0-9_-]{43}$/
export const MAX_ACTIVE_TOKENS = 10
export const TOKEN_TTL_DAYS = [30, 90, 365] as const
/** `lastUsedAt` is a hint for the settings page, not an audit log. */
const LAST_USED_RESOLUTION_MS = 5 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000

const db = () => getDatabase().db
const hash = (token: string) => createHash('sha256').update(token).digest('hex')

export function isMcpToken(token: string) {
  return token.startsWith(MCP_TOKEN_PREFIX)
}

const live = (now: Date) =>
  and(
    isNull(mcpTokens.revokedAt),
    or(isNull(mcpTokens.expiresAt), gt(mcpTokens.expiresAt, now))
  )

export interface McpTokenSummary {
  id: number
  name: string
  prefix: string
  createdAt: string
  lastUsedAt: string | null
  expiresAt: string | null
}

function summary(row: typeof mcpTokens.$inferSelect): McpTokenSummary {
  return {
    id: row.id,
    name: row.name,
    prefix: row.prefix,
    createdAt: row.createdAt.toISOString(),
    lastUsedAt: row.lastUsedAt?.toISOString() ?? null,
    expiresAt: row.expiresAt?.toISOString() ?? null,
  }
}

/** The reader's live tokens, newest first. */
export async function listMcpTokens(userId: number) {
  const rows = await db()
    .select()
    .from(mcpTokens)
    .where(and(eq(mcpTokens.userId, userId), live(new Date())))
    .orderBy(desc(mcpTokens.id))
  return rows.map(summary)
}

/** Creates a token; the returned `token` is the only copy of the plaintext. */
export async function createMcpToken(
  userId: number,
  name: string,
  ttlDays?: number | null
) {
  const now = new Date()
  const [{ active }] = await db()
    .select({ active: count() })
    .from(mcpTokens)
    .where(and(eq(mcpTokens.userId, userId), live(now)))
  if (active >= MAX_ACTIVE_TOKENS)
    throw new ApiError(
      `You can have at most ${MAX_ACTIVE_TOKENS} active tokens. Revoke one first.`,
      409,
      'TOO_MANY_TOKENS'
    )
  const token = MCP_TOKEN_PREFIX + randomBytes(32).toString('base64url')
  const [row] = await db()
    .insert(mcpTokens)
    .values({
      userId,
      name,
      tokenHash: hash(token),
      prefix: token.slice(0, MCP_TOKEN_PREFIX.length + 5),
      expiresAt: ttlDays ? new Date(now.getTime() + ttlDays * DAY_MS) : null,
    })
    .returning()
  return { token, ...summary(row) }
}

export async function revokeMcpToken(userId: number, id: number) {
  const revoked = await db()
    .update(mcpTokens)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(mcpTokens.id, id),
        eq(mcpTokens.userId, userId),
        isNull(mcpTokens.revokedAt)
      )
    )
    .returning({ id: mcpTokens.id })
  if (!revoked.length) throw new ApiError('token not found', 404)
}

/**
 * The owner of a live token, or null when the token is malformed, unknown,
 * revoked, expired, or its owner's account is gone.
 */
export async function resolveMcpToken(token: string) {
  if (!MCP_TOKEN.test(token)) return null
  const now = new Date()
  const [row] = await db()
    .select({
      id: mcpTokens.id,
      userId: mcpTokens.userId,
      expiresAt: mcpTokens.expiresAt,
      lastUsedAt: mcpTokens.lastUsedAt,
    })
    .from(mcpTokens)
    .innerJoin(users, eq(users.id, mcpTokens.userId))
    .where(
      and(
        eq(mcpTokens.tokenHash, hash(token)),
        live(now),
        isNull(users.deletedAt)
      )
    )
  if (!row) return null
  if (
    !row.lastUsedAt ||
    now.getTime() - row.lastUsedAt.getTime() > LAST_USED_RESOLUTION_MS
  ) {
    await db()
      .update(mcpTokens)
      .set({ lastUsedAt: now })
      .where(eq(mcpTokens.id, row.id))
  }
  return { tokenId: row.id, userId: row.userId, expiresAt: row.expiresAt }
}
