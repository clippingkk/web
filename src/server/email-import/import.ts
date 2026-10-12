import { metrics, trace } from '@opentelemetry/api'
import { logs, SeverityNumber } from '@opentelemetry/api-logs'
import { and, desc, eq } from 'drizzle-orm'

import { wenquRequest, type WenquSearchResponse } from '@/services/wenqu'

import { clippingDataId, insertClippings } from '../clippings/create'
import { activeClipping, matchedBook } from '../clippings/queries'
import { getDatabase } from '../db'
import { clippings, readerNotes } from '../db/schema'
import { getServerEnv } from '../env'
import { ApiError } from '../errors'
import { boundedText } from '../http'
import { getResend } from '../integrations'
import type { EmailImportJob } from '../jobs/queues'
import {
  findVerifiedBinding,
  markEmailImported,
  normalizeEmail,
  parseEmailAddress,
} from './bindings'
import { parseKindleNotebook, type KindleNotebook } from './kindle-notebook'
import { claimReplyQuota, replyWithNotebookJson } from './reply'

/**
 * Imports the Kindle notebook exports attached to an email Resend received
 * (queued by `webhook.ts`). Highlights become the sender's clippings and notes
 * go to `reader_notes`. A sender no reader has verified gets the notebook back
 * as JSON instead (`reply.ts`). Problems a retry cannot fix (no notebook, a
 * forged sender, a reply limit) are logged and end the job; anything else
 * throws so the queue retries it.
 */

const meter = metrics.getMeter('clippingkk.web.email-import')
const logger = logs.getLogger('clippingkk.web.email-import')
const emailsProcessed = meter.createCounter('app.email_import.emails', {
  description: 'Inbound emails processed by the Kindle notebook import',
})
const authenticationResults = meter.createCounter(
  'app.email_import.authentication',
  {
    description:
      'DMARC results Resend reported for inbound emails (absent when it reported none)',
  }
)

/** RFC 8601 DMARC results; anything else is reported as `other`. */
const DMARC_RESULTS = new Set([
  'pass',
  'fail',
  'none',
  'temperror',
  'permerror',
])

/** What a sender may make the worker download: verified readers get more. */
const ATTACHMENT_LIMITS = {
  verified: { count: 5, bytes: 10 * 1024 * 1024 },
  unverified: { count: 1, bytes: 5 * 1024 * 1024 },
} as const
type AttachmentLimit =
  (typeof ATTACHMENT_LIMITS)[keyof typeof ATTACHMENT_LIMITS]
/** Keeps an insert well under Postgres' 65,535 bind parameters. */
const INSERT_CHUNK = 200
const KINDLE = 1

type Outcome =
  | 'imported'
  | 'replied'
  | 'reply_limited'
  | 'not_addressed'
  | 'unreadable_sender'
  | 'failed_authentication'
  | 'missing'
  | 'no_notebook'

const db = () => getDatabase().db

function log(
  severity: 'INFO' | 'WARN' | 'ERROR',
  body: string,
  attributes: Record<string, string | number>
) {
  logger.emit({
    severityNumber: SeverityNumber[severity],
    severityText: severity,
    body,
    attributes,
  })
  // Container logs stay useful when no collector is configured.
  const line = `email-import: ${body} ${JSON.stringify(attributes)}`
  if (severity === 'ERROR') console.error(line)
  else if (severity === 'WARN') console.warn(line)
}

/** `reader@icloud.com` → `r***@icloud.com`: enough to trace, not to harvest. */
function maskEmail(email: string) {
  const at = email.lastIndexOf('@')
  return at < 1 ? '***' : `${email[0]}***${email.slice(at)}`
}

function header(headers: Record<string, string> | null, name: string) {
  const key = Object.keys(headers ?? {}).find(
    (item) => item.toLowerCase() === name
  )
  return key ? headers![key] : undefined
}

/**
 * Highlights compare equal across the .txt and HTML exports when their text
 * does: the two disagree on whitespace and on how locations are written.
 */
function sameText(content: string) {
  return content
    .replace(/\s+/g, '')
    .replace(/^[，,。！@【】—]+|[，,。！@【】—]+$/g, '')
}

async function resolveBookId(userId: number, title: string) {
  const [known] = await db()
    .select({ bookId: clippings.bookId })
    .from(clippings)
    .where(
      and(
        eq(clippings.createdBy, userId),
        eq(clippings.title, title),
        matchedBook
      )
    )
    .orderBy(desc(clippings.id))
    .limit(1)
  if (known) return known.bookId
  try {
    const result = await wenquRequest<WenquSearchResponse>(
      `/books/search?query=${encodeURIComponent(title)}&limit=50&offset=0`,
      { signal: AbortSignal.timeout(8_000) }
    )
    return result.count > 0 && result.books[0]
      ? String(result.books[0].doubanId)
      : '0'
  } catch {
    // Unmatched clippings can still be matched from the book page later.
    return '0'
  }
}

async function saveNotebook(
  userId: number,
  notebook: KindleNotebook,
  receivedAt: number
) {
  const { title } = notebook
  const bookId = await resolveBookId(userId, title)
  // Deleted rows count too, so re-sending an export doesn't revive them.
  const existing = await db()
    .select({ content: clippings.content })
    .from(clippings)
    .where(and(eq(clippings.createdBy, userId), eq(clippings.title, title)))
  // Matching on text alone also folds two identical highlights on different
  // pages into one: rare, and the price of not doubling every .txt import.
  const seen = new Set(existing.map((row) => sameText(row.content)))

  const drafts = notebook.highlights.flatMap((highlight, index) => {
    const key = sameText(highlight.content)
    if (seen.has(key)) return []
    seen.add(key)
    return [
      {
        title,
        content: highlight.content,
        bookId,
        pageAt: highlight.pageAt,
        // One timestamp per email; the offset keeps the export's order.
        createdAt: new Date(receivedAt + index),
        source: KINDLE,
      },
    ]
  })
  let created = 0
  for (let i = 0; i < drafts.length; i += INSERT_CHUNK)
    created += (
      await insertClippings(userId, drafts.slice(i, i + INSERT_CHUNK), {
        visible: true,
      })
    ).length

  let notes = 0
  if (notebook.notes.length) {
    const live = await db()
      .select({ id: clippings.id, content: clippings.content })
      .from(clippings)
      .where(
        and(
          eq(clippings.createdBy, userId),
          eq(clippings.title, title),
          activeClipping
        )
      )
    const idByText = new Map(live.map((row) => [sameText(row.content), row.id]))
    const rows = notebook.notes.map((note, index) => ({
      userId,
      clippingId:
        note.highlight === null
          ? null
          : (idByText.get(
              sameText(notebook.highlights[note.highlight].content)
            ) ?? null),
      title,
      pageAt: note.pageAt,
      content: note.content,
      // The same note typed twice at one spot is kept once.
      dataId: clippingDataId(userId, note.content, note.pageAt),
      createdAt: new Date(receivedAt + index),
    }))
    for (let i = 0; i < rows.length; i += INSERT_CHUNK)
      notes += (
        await db()
          .insert(readerNotes)
          .values(rows.slice(i, i + INSERT_CHUNK))
          .onConflictDoNothing()
          .returning({ id: readerNotes.id })
      ).length
  }

  return { created, notes }
}

/** The notebook HTML attached to the email, or its body when nothing is. */
async function notebookSources(
  emailId: string,
  body: string | null,
  limit: AttachmentLimit
) {
  const { data, error } = await getResend().emails.receiving.attachments.list({
    emailId,
    limit: 100,
  })
  if (error) throw new Error(`Resend attachments: ${error.message}`)
  const html = data.data
    .filter(
      (item) =>
        item.content_type.toLowerCase().startsWith('text/html') ||
        /\.html?$/i.test(item.filename ?? '')
    )
    .slice(0, limit.count)
  const sources: { name: string; html: string }[] = []
  for (const attachment of html) {
    const name = attachment.filename ?? attachment.id
    if (attachment.size > limit.bytes) {
      log('WARN', 'Attachment is too large to import', {
        'resend.email_id': emailId,
        'attachment.size': attachment.size,
      })
      continue
    }
    const response = await fetch(attachment.download_url, {
      signal: AbortSignal.timeout(15_000),
    })
    if (!response.ok)
      throw new Error(`Attachment download returned ${response.status}`)
    try {
      sources.push({
        name,
        html: await boundedText(response, limit.bytes),
      })
    } catch (error) {
      if (!(error instanceof ApiError)) throw error
      log('WARN', 'Attachment is too large to import', {
        'resend.email_id': emailId,
      })
    }
  }
  if (!sources.length && body) sources.push({ name: 'body', html: body })
  return sources
}

async function run(job: EmailImportJob): Promise<Outcome> {
  const span = trace.getActiveSpan()
  const context = { 'resend.email_id': job.emailId }
  span?.setAttributes(context)

  const inbound = getServerEnv().INBOUND_EMAIL_ADDRESS
  if (inbound) {
    const recipients = [...job.to, ...job.receivedFor].map(parseEmailAddress)
    if (!recipients.includes(normalizeEmail(inbound))) {
      log('WARN', 'Email is not addressed to the import address', context)
      return 'not_addressed'
    }
  }

  const sender = parseEmailAddress(job.from)
  if (!sender) {
    log('WARN', 'Email has no readable sender address', context)
    return 'unreadable_sender'
  }
  const binding = await findVerifiedBinding(sender)
  const who = {
    ...context,
    'email.sender': maskEmail(sender),
    'email.sender_domain': sender.split('@')[1] ?? '',
  }
  if (binding) span?.setAttribute('user.id', binding.userId)
  else {
    log('ERROR', 'Email import sender is not bound to any reader', who)
    // Strangers are counted before any download, so their mail costs little
    // once they are over the limit, notebook or not.
    const quota = await claimReplyQuota(sender, job.emailId)
    if (quota !== 'allowed') {
      log('WARN', 'Notebook JSON reply limit reached', {
        ...who,
        'reply.limit': quota,
      })
      return 'reply_limited'
    }
  }

  const { data: email, error } = await getResend().emails.receiving.get(
    job.emailId
  )
  if (error) {
    if (error.name === 'not_found') {
      log('WARN', 'Received email no longer exists at Resend', context)
      return 'missing'
    }
    throw new Error(`Resend receiving: ${error.message}`)
  }
  // From is easy to forge; refuse mail its own domain says is not genuine,
  // and never answer it.
  const authentication = header(email.headers, 'authentication-results') ?? ''
  const reported = authentication.match(/\bdmarc=(\w+)/i)?.[1]?.toLowerCase()
  const dmarc = !reported
    ? 'absent'
    : DMARC_RESULTS.has(reported)
      ? reported
      : 'other'
  span?.setAttribute('email.dmarc', dmarc)
  authenticationResults.add(1, {
    dmarc,
    sender: binding ? 'verified' : 'unverified',
  })
  if (dmarc === 'fail') {
    log('ERROR', 'Email failed sender authentication', who)
    return 'failed_authentication'
  }

  const notebooks: KindleNotebook[] = []
  const sources = await notebookSources(
    job.emailId,
    email.html,
    binding ? ATTACHMENT_LIMITS.verified : ATTACHMENT_LIMITS.unverified
  )
  for (const source of sources) {
    const notebook = parseKindleNotebook(source.html)
    if (notebook) notebooks.push(notebook)
  }
  if (!notebooks.some((item) => item.highlights.length || item.notes.length)) {
    // Mail without a notebook is never answered, so spam gets no reply.
    log('WARN', 'Email has no Kindle notebook to import', {
      ...context,
      ...(binding ? { 'user.id': binding.userId } : {}),
    })
    return 'no_notebook'
  }
  const receivedAt = Number.isNaN(Date.parse(job.receivedAt))
    ? Date.now()
    : Date.parse(job.receivedAt)

  if (!binding) {
    const sent = await replyWithNotebookJson({
      to: sender,
      subject: job.subject,
      messageId: email.message_id ?? null,
      emailId: job.emailId,
      notebooks,
      receivedAt,
    })
    log('INFO', 'Replied to an unbound sender with the notebook as JSON', {
      ...who,
      'reply.clippings': sent.clippings,
      'reply.notes': sent.notes,
    })
    return 'replied'
  }

  let highlights = 0
  let created = 0
  let notes = 0
  for (const notebook of notebooks) {
    const saved = await saveNotebook(binding.userId, notebook, receivedAt)
    highlights += notebook.highlights.length
    created += saved.created
    notes += saved.notes
  }

  await markEmailImported(binding.id)
  log('INFO', 'Kindle notebook imported from email', {
    ...context,
    'user.id': binding.userId,
    'import.highlights': highlights,
    'import.clippings_created': created,
    'import.notes_created': notes,
  })
  return 'imported'
}

export async function importEmail(job: EmailImportJob) {
  const outcome = await run(job)
  emailsProcessed.add(1, { outcome })
  return outcome
}
