import { createHash } from 'node:crypto'

import { and, eq } from 'drizzle-orm'

import { getDatabase } from '../db'
import {
  clippings,
  nouns,
  webHookRecords,
  webHooks,
  type Clipping,
} from '../db/schema'
import { cacheDelete } from '../redis'

/**
 * Saving clippings, shared by the `createClippings` mutation (the browser's
 * My Clippings.txt import) and the email import of Kindle notebook exports.
 */

const db = () => getDatabase().db

export interface ClippingDraft {
  title: string
  content: string
  bookId: string
  pageAt: string
  /** Anything `new Date()` takes; an invalid value falls back to now. */
  createdAt: Date | string
  /** 0 unknown, 1 kindle, 2 weread. */
  source: number
}

/**
 * The dedup key behind the `clipping_data_iduq` unique index. It hashes the
 * untrimmed content, so the same highlight from the same reader is stored once.
 */
export function clippingDataId(
  userId: number,
  content: string,
  pageAt: string
) {
  return createHash('sha256')
    .update(`${content}${pageAt}${userId}`)
    .digest('hex')
}

const trimEdges = (value: string) => value.replace(/^[，,\s]+|[，,\s]+$/g, '')

/**
 * Inserts the reader's clippings, skipping ones already saved, and returns the
 * rows actually inserted. Notifies the reader's webhook and clears their cached
 * book list.
 */
export async function insertClippings(
  userId: number,
  drafts: readonly ClippingDraft[],
  { visible }: { visible: boolean }
) {
  const globalNouns = await db()
    .select({ id: nouns.id, noun: nouns.noun })
    .from(nouns)
    .where(eq(nouns.scope, 0))
  const updatedAt = new Date()
  const values = drafts.map((item) => {
    const createdAt = new Date(item.createdAt)
    return {
      title: trimEdges(String(item.title)),
      content: trimEdges(String(item.content)),
      bookId: String(item.bookId),
      pageAt: String(item.pageAt),
      dataId: clippingDataId(userId, item.content, item.pageAt),
      seq: -1,
      createdBy: userId,
      visible,
      nouns: globalNouns
        .filter((noun) => item.content.includes(noun.noun))
        .map((noun) => noun.id),
      source: item.source,
      createdAt: Number.isNaN(createdAt.getTime()) ? new Date() : createdAt,
      updatedAt,
    }
  })
  const created = values.length
    ? await db()
        .insert(clippings)
        .values(values)
        .onConflictDoNothing()
        .returning()
    : []
  void webhookForClippings(userId, created).catch(console.error)
  await cacheDelete(`ck:books:${userId}`)
  return created
}

async function webhookForClippings(userId: number, created: Clipping[]) {
  if (!created.length) return
  const hook = await db().query.webHooks.findFirst({
    where: and(eq(webHooks.owner, userId), eq(webHooks.step, 0)),
  })
  if (!hook) return
  const start = new Date()
  let status = 0
  let responseBody = ''
  let responseHeaders = '{}'
  let errorMessage = ''
  try {
    const response = await fetch(hook.hookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(created),
      signal: AbortSignal.timeout(15_000),
    })
    status = response.status
    responseBody = (await response.text()).slice(0, 64_000)
    responseHeaders = JSON.stringify(Object.fromEntries(response.headers))
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : String(error)
  }
  await db()
    .insert(webHookRecords)
    .values({
      requestMethod: 'POST',
      requestUrl: hook.hookUrl,
      requestHeaders: { 'Content-Type': 'application/json' },
      requestBody: JSON.stringify(created),
      responseStatus: status,
      responseHeaders,
      responseBody,
      startTime: start,
      endTime: new Date(),
      errorMessage,
      webHookRecords: hook.id,
    })
}
