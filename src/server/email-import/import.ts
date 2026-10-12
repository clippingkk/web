import { metrics, trace } from '@opentelemetry/api'

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
import { log, maskEmail } from './log'
import {
  admitUnverifiedEmail,
  claimReplyQuota,
  replyWithNotebookJson,
} from './reply'
import { saveNotebook } from './save'

/**
 * Imports the Kindle notebook exports attached to an email Resend received
 * (queued by `webhook.ts`). Highlights become the sender's clippings and notes
 * go to `reader_notes`. A sender no reader has verified gets the notebook back
 * as JSON instead (`reply.ts`). Problems a retry cannot fix (no notebook, a
 * forged sender, a reply limit) are logged and end the job; anything else
 * throws so the queue retries it.
 */

const meter = metrics.getMeter('clippingkk.web.email-import')
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

type Outcome =
  | 'imported'
  | 'replied'
  | 'reply_limited'
  | 'not_addressed'
  | 'unreadable_sender'
  | 'failed_authentication'
  | 'missing'
  | 'no_notebook'

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
    // Resend hands out signed https links; refuse anything else.
    if (new URL(attachment.download_url).protocol !== 'https:')
      throw new Error('Attachment download link is not https')
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
  // From is the only credential, so only a DMARC pass stamped by the pinned
  // EMAIL_IMPORT_AUTHSERV_ID is imported or answered: that also stops
  // forgeries from domains with no DMARC policy (`none`). Mail with no
  // result, or with a pass nobody pinned, is refused too unless
  // EMAIL_IMPORT_ALLOW_MISSING_DMARC says otherwise; the metric shows how
  // often each happens.
  const dmarc = dmarcResult(
    email.headers,
    env.EMAIL_IMPORT_AUTHSERV_ID || undefined
  )
  span?.setAttribute('email.dmarc', dmarc)
  authenticationResults.add(1, {
    dmarc,
    sender: binding ? 'verified' : 'unverified',
  })
  const allowMissing = env.EMAIL_IMPORT_ALLOW_MISSING_DMARC === '1'
  const unproven = dmarc === 'absent' || dmarc === 'unpinned'
  if (dmarc !== 'pass' && !(unproven && allowMissing)) {
    log('ERROR', 'Email failed sender authentication', {
      ...who,
      'email.dmarc': dmarc,
      ...(dmarc === 'unpinned'
        ? { hint: 'set EMAIL_IMPORT_AUTHSERV_ID to trust this pass' }
        : {}),
    })
    return 'failed_authentication'
  }
  if (unproven)
    log('WARN', 'Accepted an email without a trusted DMARC pass', {
      ...who,
      'email.dmarc': dmarc,
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
  const receivedAt = Number.isNaN(Date.parse(job.receivedAt))
    ? Date.now()
    : Date.parse(job.receivedAt)

  if (!binding) {
    const quota = await claimReplyQuota(sender, job.emailId)
    if (quota !== 'allowed') {
      log('WARN', 'Notebook JSON reply limit reached', {
        ...who,
        'reply.limit': quota,
      })
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
