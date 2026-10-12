import { count, desc, eq, isNull, sql } from 'drizzle-orm'

import { getDatabase } from '../db'
import { inboundEmails } from '../db/schema'
import type { EmailImportJob } from '../jobs/queues'
import type { DmarcResult } from './authentication'
import { parseEmailAddress } from './bindings'

/**
 * One row per email the import address received, written by the worker after
 * every attempt (`import.ts`). Readers see the mail their verified addresses
 * sent; administrators see the mail nobody's verified address sent.
 */

export const INBOUND_EMAIL_STATUSES = [
  'imported',
  'replied',
  'reply_limited',
  'not_addressed',
  'unreadable_sender',
  'failed_authentication',
  'missing',
  'no_notebook',
  'retrying',
  'failed',
] as const
export type InboundEmailStatus = (typeof INBOUND_EMAIL_STATUSES)[number]
/** How an attempt that didn't throw ended. */
export type ImportOutcome = Exclude<InboundEmailStatus, 'retrying' | 'failed'>

/** What an attempt learned about the email, filled in as it goes. */
export interface InboundEmailFacts {
  userId: number | null
  dmarc: DmarcResult | null
  books: string[]
  highlights: number
  /** Saved by this attempt only; the record adds them up across retries. */
  clippingsCreated: number
  notesCreated: number
  /** The reply limit reached, or the error a thrown attempt ended with. */
  detail: string | null
}

export function emptyFacts(): InboundEmailFacts {
  return {
    userId: null,
    dmarc: null,
    books: [],
    highlights: 0,
    clippingsCreated: 0,
    notesCreated: 0,
    detail: null,
  }
}

/** At most `max` characters, without NULs (Postgres refuses them in text). */
export function clipText(value: string, max: number) {
  // Cut by code point so an emoji isn't split in half.
  return Array.from(value.replaceAll('\u0000', '')).slice(0, max).join('')
}

/** When Resend received the email, or now if its timestamp doesn't parse. */
export function receivedAtOf(job: EmailImportJob) {
  const at = Date.parse(job.receivedAt)
  return Number.isNaN(at) ? Date.now() : at
}

export async function recordInboundEmail(
  job: EmailImportJob,
  status: InboundEmailStatus,
  facts: InboundEmailFacts,
  attempt: number
) {
  const values = {
    emailId: job.emailId,
    userId: facts.userId,
    // The raw header, when it holds no address, shows what was there.
    sender: clipText(parseEmailAddress(job.from) ?? job.from, 255),
    subject: clipText(job.subject, 512),
    status,
    detail: facts.detail === null ? null : clipText(facts.detail, 255),
    dmarc: facts.dmarc,
    books: facts.books,
    highlights: facts.highlights,
    clippingsCreated: facts.clippingsCreated,
    notesCreated: facts.notesCreated,
    attempts: attempt,
    receivedAt: new Date(receivedAtOf(job)),
  }
  await getDatabase()
    .db.insert(inboundEmails)
    .values(values)
    .onConflictDoUpdate({
      target: inboundEmails.emailId,
      set: {
        status: values.status,
        detail: values.detail,
        dmarc: values.dmarc,
        books: values.books,
        highlights: values.highlights,
        attempts: values.attempts,
        // A retry that no longer finds the binding still filed clippings with
        // the reader the first attempt found.
        userId: sql`coalesce(excluded.user_id, ${inboundEmails.userId})`,
        // A retry only saves what the attempts before it didn't.
        clippingsCreated: sql`${inboundEmails.clippingsCreated} + excluded.clippings_created`,
        notesCreated: sql`${inboundEmails.notesCreated} + excluded.notes_created`,
        updatedAt: new Date(),
      },
    })
}

export interface InboundEmailSummary {
  id: number
  sender: string
  subject: string
  status: InboundEmailStatus
  /** Administrators only: errors can name internals. */
  detail: string | null
  dmarc: string | null
  books: string[]
  highlights: number
  clippingsCreated: number
  notesCreated: number
  attempts: number
  receivedAt: string
}

const summaryColumns = {
  id: inboundEmails.id,
  sender: inboundEmails.sender,
  subject: inboundEmails.subject,
  status: inboundEmails.status,
  detail: inboundEmails.detail,
  dmarc: inboundEmails.dmarc,
  books: inboundEmails.books,
  highlights: inboundEmails.highlights,
  clippingsCreated: inboundEmails.clippingsCreated,
  notesCreated: inboundEmails.notesCreated,
  attempts: inboundEmails.attempts,
  receivedAt: inboundEmails.receivedAt,
}

function summary(
  row: Omit<InboundEmailSummary, 'status' | 'receivedAt'> & {
    status: string
    receivedAt: Date
  }
): InboundEmailSummary {
  return {
    ...row,
    status: row.status as InboundEmailStatus,
    receivedAt: row.receivedAt.toISOString(),
  }
}

/** The newest email a reader's verified addresses sent, and how many in all. */
export async function listInboundEmails(userId: number, limit = 50) {
  const db = getDatabase().db
  const mine = eq(inboundEmails.userId, userId)
  const [rows, [{ total }]] = await Promise.all([
    db
      .select(summaryColumns)
      .from(inboundEmails)
      .where(mine)
      .orderBy(desc(inboundEmails.receivedAt), desc(inboundEmails.id))
      .limit(limit),
    db.select({ total: count() }).from(inboundEmails).where(mine),
  ])
  return {
    total,
    emails: rows.map((row) => ({ ...summary(row), detail: null })),
  }
}

/** Email no reader's verified address sent, newest first (administrators). */
export async function listUnverifiedInboundEmails({
  limit,
  offset,
}: {
  limit: number
  offset: number
}) {
  const rows = await getDatabase()
    .db.select(summaryColumns)
    .from(inboundEmails)
    .where(isNull(inboundEmails.userId))
    .orderBy(desc(inboundEmails.receivedAt), desc(inboundEmails.id))
    .limit(limit)
    .offset(offset)
  return rows.map(summary)
}
