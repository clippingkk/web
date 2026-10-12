import { metrics, trace } from '@opentelemetry/api'
import { logs, SeverityNumber } from '@opentelemetry/api-logs'
import { and, desc, eq } from 'drizzle-orm'

import { wenquRequest, type WenquSearchResponse } from '@/services/wenqu'

import { clippingDataId, insertClippings } from '../clippings/create'
import { matchedBook } from '../clippings/queries'
import { getDatabase } from '../db'
import { clippings, readerNotes } from '../db/schema'
import { getServerEnv } from '../env'
import { ApiError } from '../errors'
import { boundedText } from '../http'
import { getResend } from '../integrations'
import type { EmailImportJob } from '../jobs/queues'
import { dmarcResult } from './authentication'
import {
  findVerifiedBinding,
  markEmailImported,
  normalizeEmail,
  parseEmailAddress,
} from './bindings'
import { parseKindleNotebook, type KindleNotebook } from './kindle-notebook'
import {
  clipText,
  emptyFacts,
  receivedAtOf,
  recordInboundEmail,
  type ImportOutcome,
  type InboundEmailFacts,
  type InboundEmailStatus,
} from './records'
import {
  admitUnverifiedEmail,
  claimReplyQuota,
  replyWithNotebookJson,
} from './reply'

/**
 * Imports the Kindle notebook exports attached to an email Resend received
 * (queued by `webhook.ts`). Highlights become the sender's clippings and notes
 * go to `reader_notes`. A sender no reader has verified gets the notebook back
 * as JSON instead (`reply.ts`). Problems a retry cannot fix (no notebook, a
 * forged sender, a reply limit) are logged and end the job; anything else
 * throws so the queue retries it. Every attempt is recorded in
 * `inbound_emails` (`records.ts`).
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

/**
 * Highlights compare equal across the .txt and HTML exports when their text
 * does: the two disagree on whitespace and on how locations are written.
 */
function sameText(content: string) {
  return content
    .replace(/\s+/g, '')
    .replace(/^[，,。！@【】—]+|[，,。！@【】—]+$/g, '')
}

/** A title with case, spacing and punctuation folded away, for matching. */
function bookKey(title: string) {
  return title
    .split(/[(（]/)[0]
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]+/gu, '')
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
    // A loose search can rank another book first; leaving the clippings
    // unmatched (fixable from the book page) beats filing them wrongly.
    const wanted = bookKey(title)
    const match = result.books.find((book) =>
      [book.title, book.originTitle].some((name) => {
        const key = bookKey(name ?? '')
        // Kindle titles often carry a subtitle Douban files separately.
        const [short, long] =
          key.length < wanted.length ? [key, wanted] : [wanted, key]
        return short.length >= 2 && long.includes(short)
      })
    )
    return match ? String(match.doubanId) : '0'
  } catch {
    // Unmatched clippings can still be matched from the book page later.
    return '0'
  }
}

/**
 * Not one transaction: if the job dies between the clippings and the notes,
 * its retry skips the clippings already saved and adds the notes. What each
 * chunk saved is counted in `facts` at once, so a failed attempt reports it.
 */
async function saveNotebook(
  userId: number,
  notebook: KindleNotebook,
  receivedAt: number,
  facts: InboundEmailFacts
) {
  const { title } = notebook
  const bookId = await resolveBookId(userId, title)
  // Deleted rows count too, so re-sending an export doesn't revive them.
  const existing = await db()
    .select({
      id: clippings.id,
      content: clippings.content,
      deletedAt: clippings.deletedAt,
    })
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
  // Notes link to live clippings: the ones already there and the new ones.
  const idByText = new Map(
    existing
      .filter((row) => !row.deletedAt)
      .map((row) => [sameText(row.content), row.id])
  )
  for (let i = 0; i < drafts.length; i += INSERT_CHUNK) {
    const rows = await insertClippings(
      userId,
      drafts.slice(i, i + INSERT_CHUNK),
      { visible: true }
    )
    facts.clippingsCreated += rows.length
    for (const row of rows) idByText.set(sameText(row.content), row.id)
  }

  if (notebook.notes.length) {
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
      facts.notesCreated += (
        await db()
          .insert(readerNotes)
          .values(rows.slice(i, i + INSERT_CHUNK))
          .onConflictDoNothing()
          .returning({ id: readerNotes.id })
      ).length
  }
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

async function run(
  job: EmailImportJob,
  facts: InboundEmailFacts
): Promise<ImportOutcome> {
  const span = trace.getActiveSpan()
  const context = { 'resend.email_id': job.emailId }
  span?.setAttributes(context)

  const env = getServerEnv()
  const inbound = env.INBOUND_EMAIL_ADDRESS
  // Without the import address there's no telling import mail from anything
  // else the receiving domain gets (the webhook refuses it too).
  if (!inbound) {
    log('WARN', 'Email import has no INBOUND_EMAIL_ADDRESS', context)
    return 'not_addressed'
  }
  const recipients = [...job.to, ...job.receivedFor].map(parseEmailAddress)
  if (!recipients.includes(normalizeEmail(inbound))) {
    log('WARN', 'Email is not addressed to the import address', context)
    return 'not_addressed'
  }

  const sender = parseEmailAddress(job.from)
  if (!sender) {
    log('WARN', 'Email has no readable sender address', context)
    return 'unreadable_sender'
  }
  const binding = await findVerifiedBinding(sender)
  facts.userId = binding?.userId ?? null
  const who = {
    ...context,
    'email.sender': maskEmail(sender),
    'email.sender_domain': sender.split('@')[1] ?? '',
  }
  if (binding) span?.setAttribute('user.id', binding.userId)
  else {
    log('ERROR', 'Email import sender is not bound to any reader', who)
    // Nothing is fetched for a sender already at its reply limit, nor past
    // the daily cap on strangers' mail.
    const quota = await admitUnverifiedEmail(sender, job.emailId)
    if (quota !== 'allowed') {
      log('WARN', 'Notebook JSON reply limit reached', {
        ...who,
        'reply.limit': quota,
      })
      facts.detail = quota
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
  // From is the only credential, so only a DMARC pass is imported or
  // answered: that also stops forgeries from domains with no DMARC policy
  // (`none`). Mail Resend reports no result for is refused too, unless
  // EMAIL_IMPORT_ALLOW_MISSING_DMARC says otherwise; the metric shows how
  // often that happens.
  const dmarc = dmarcResult(
    email.headers,
    env.EMAIL_IMPORT_AUTHSERV_ID || undefined
  )
  span?.setAttribute('email.dmarc', dmarc)
  facts.dmarc = dmarc
  authenticationResults.add(1, {
    dmarc,
    sender: binding ? 'verified' : 'unverified',
  })
  const allowMissing = env.EMAIL_IMPORT_ALLOW_MISSING_DMARC === '1'
  if (dmarc !== 'pass' && !(dmarc === 'absent' && allowMissing)) {
    log('ERROR', 'Email failed sender authentication', {
      ...who,
      'email.dmarc': dmarc,
    })
    return 'failed_authentication'
  }
  if (dmarc === 'absent')
    log('WARN', 'Accepted an email with no DMARC result', {
      ...who,
      reason: 'EMAIL_IMPORT_ALLOW_MISSING_DMARC=1',
    })

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
  facts.books = notebooks.map((notebook) => clipText(notebook.title, 255))
  facts.highlights = notebooks.reduce(
    (sum, notebook) => sum + notebook.highlights.length,
    0
  )
  const receivedAt = receivedAtOf(job)

  if (!binding) {
    const quota = await claimReplyQuota(sender, job.emailId)
    if (quota !== 'allowed') {
      log('WARN', 'Notebook JSON reply limit reached', {
        ...who,
        'reply.limit': quota,
      })
      facts.detail = quota
      return 'reply_limited'
    }
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

  for (const notebook of notebooks)
    await saveNotebook(binding.userId, notebook, receivedAt, facts)

  await markEmailImported(binding.id)
  log('INFO', 'Kindle notebook imported from email', {
    ...context,
    'user.id': binding.userId,
    'import.highlights': facts.highlights,
    'import.clippings_created': facts.clippingsCreated,
    'import.notes_created': facts.notesCreated,
  })
  return 'imported'
}

/** The history is for people; losing a row must not fail or redo an import. */
async function record(
  job: EmailImportJob,
  status: InboundEmailStatus,
  facts: InboundEmailFacts,
  attempt: number
) {
  try {
    await recordInboundEmail(job, status, facts, attempt)
  } catch (error) {
    log('WARN', 'Could not record the inbound email', {
      'resend.email_id': job.emailId,
      'error.message': error instanceof Error ? error.message : String(error),
    })
  }
}

/**
 * `attempt` counts from 1; `final` says the queue won't try again, so a throw
 * is recorded as `failed` rather than `retrying`.
 */
export async function importEmail(
  job: EmailImportJob,
  { attempt = 1, final = false }: { attempt?: number; final?: boolean } = {}
) {
  const facts = emptyFacts()
  let outcome: ImportOutcome
  try {
    outcome = await run(job, facts)
  } catch (error) {
    // The first line only: database errors list the query's values after it.
    const message = error instanceof Error ? error.message : String(error)
    facts.detail = message.split('\n')[0]
    await record(job, final ? 'failed' : 'retrying', facts, attempt)
    throw error
  }
  await record(job, outcome, facts, attempt)
  emailsProcessed.add(1, { outcome })
  return outcome
}
