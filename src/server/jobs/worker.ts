import { metrics, trace } from '@opentelemetry/api'
import { logs, SeverityNumber } from '@opentelemetry/api-logs'
import { withSpan } from '@superlog/otel-helpers'
import { Worker, type Job } from 'bullmq'
import { and, asc, eq, isNull, sql } from 'drizzle-orm'
import { Resend } from 'resend'

import { getDatabase } from '../db'
import { clippings, externalAccounts, users } from '../db/schema'
import { requireEnv } from '../env'
import { getNotion } from '../integrations'
import { cacheGet } from '../redis'
import {
  AUDITING_EMAIL,
  JOB_QUEUE_NAME,
  pendingAccountRemovalKey,
  queueConnection,
  type ExportJob,
} from './queues'

const tracer = trace.getTracer('clippingkk.web.jobs')
const meter = metrics.getMeter('clippingkk.web.jobs')
const logger = logs.getLogger('clippingkk.web.jobs')
const jobsProcessed = meter.createCounter('app.jobs.processed', {
  description: 'Completed background jobs',
})
const jobDuration = meter.createHistogram('app.jobs.duration', {
  description: 'Background job processing duration',
  unit: 'ms',
})

async function exportRows(uid: number) {
  return getDatabase()
    .db.select({
      title: clippings.title,
      content: clippings.content,
      pageAt: clippings.pageAt,
      bookId: clippings.bookId,
      createdAt: clippings.createdAt,
    })
    .from(clippings)
    .where(and(eq(clippings.createdBy, uid), isNull(clippings.deletedAt)))
    .orderBy(asc(clippings.createdAt))
}

async function exportToFlomo(endpoint: string, uid: number) {
  const rows = await exportRows(uid)
  for (const row of rows) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `# ${row.title}\n\n${row.content}\n\n${row.pageAt}`,
      }),
    })
    if (!response.ok) throw new Error(`Flomo returned ${response.status}`)
  }
}

async function exportToNotion(value: string, uid: number) {
  const [token, pageId] = value.split('|').map((item) => item.trim())
  if (!token || !pageId)
    throw new Error('Notion args must be "token | page id"')
  const notion = getNotion(token)
  const rows = await exportRows(uid)
  for (const row of rows) {
    await notion.blocks.children.append({
      block_id: pageId,
      children: [
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [
              { type: 'text', text: { content: row.title.slice(0, 2_000) } },
            ],
          },
        },
        {
          object: 'block',
          type: 'quote',
          quote: {
            rich_text: [
              { type: 'text', text: { content: row.content.slice(0, 2_000) } },
            ],
          },
        },
      ],
    })
  }
}

async function exportToMail(email: string, uid: number) {
  const rows = await exportRows(uid)
  const payload = rows
    .map((row) => `# ${row.title}\n\n${row.content}\n\n${row.pageAt}\n`)
    .join('\n---\n\n')
  const resend = new Resend(requireEnv('RESEND_API_KEY'))
  const result = await resend.emails.send({
    from: 'ClippingKK <noreply@annatarhe.com>',
    to: email,
    subject: 'Your ClippingKK export',
    html: '<p>Your ClippingKK export is attached.</p>',
    attachments: [
      { filename: 'clippingkk-export.md', content: Buffer.from(payload) },
    ],
  })
  if (result.error) throw new Error(result.error.message)
}

async function handleJob(job: Job) {
  if (job.name === 'export-data') {
    const payload = job.data as ExportJob
    if (payload.destination === 'flomo')
      return exportToFlomo(payload.args, payload.uid)
    if (payload.destination === 'notion')
      return exportToNotion(payload.args, payload.uid)
    if (payload.destination === 'mail')
      return exportToMail(payload.args, payload.uid)
    throw new Error(
      `Unsupported export destination: ${String(payload.destination)}`
    )
  }

  if (job.name === 'noun-cleanup') {
    const nounId = Number(job.data.nounId)
    await getDatabase().db.execute(
      sql`update clippings set nouns = coalesce((select jsonb_agg(value) from jsonb_array_elements(nouns) value where value <> to_jsonb(${nounId}::int)), '[]'::jsonb) where nouns @> ${JSON.stringify([nounId])}::jsonb`
    )
    return
  }

  if (job.name === 'cancel-wechat-bind') {
    const email = String(job.data.email)
    if (email !== AUDITING_EMAIL)
      throw new Error('only the auditing WeChat account can be unbound')
    const user = await getDatabase().db.query.users.findFirst({
      where: eq(users.email, email),
    })
    if (!user) return
    await getDatabase()
      .db.delete(externalAccounts)
      .where(eq(externalAccounts.userId, user.id))
    return
  }

  if (job.name === 'cancel-apple-bind') {
    const appleUnique = String(job.data.appleUnique)
    const account = await getDatabase().db.query.externalAccounts.findFirst({
      where: eq(externalAccounts.appleUnique, appleUnique),
    })
    if (!account) return
    const user = await getDatabase().db.query.users.findFirst({
      where: eq(users.id, account.userId),
    })
    if (!user || user.email !== AUDITING_EMAIL)
      throw new Error('only the auditing Apple account can be unbound')
    await getDatabase()
      .db.update(externalAccounts)
      .set({ appleUnique: '' })
      .where(eq(externalAccounts.id, account.id))
    return
  }

  if (job.name === 'destroy-unvalidated-user') {
    await getDatabase()
      .db.update(users)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(users.id, Number(job.data.uid)),
          eq(users.checked, false),
          isNull(users.deletedAt)
        )
      )
    return
  }

  if (job.name === 'remove-account') {
    const uid = Number(job.data.uid)
    const scheduledJobId = await cacheGet<string>(pendingAccountRemovalKey(uid))
    if (!job.id || scheduledJobId !== job.id) return
    await getDatabase()
      .db.update(users)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(users.id, uid), isNull(users.deletedAt)))
    return
  }

  throw new Error(`Unknown job: ${job.name}`)
}

async function processJob(job: Job) {
  const operation = `job.${job.name}`
  return withSpan(
    operation,
    async (span) => {
      const startedAt = performance.now()
      const spanAttributes = {
        'job.name': job.name,
        'job.id': job.id ?? 'unknown',
      }
      span.setAttributes(spanAttributes)
      try {
        const result = await handleJob(job)
        const metricAttributes = { 'job.name': job.name, outcome: 'success' }
        span.setAttribute('outcome', 'success')
        jobsProcessed.add(1, metricAttributes)
        logger.emit({
          severityNumber: SeverityNumber.INFO,
          severityText: 'INFO',
          body: 'Background job completed',
          attributes: { ...spanAttributes, outcome: 'success' },
        })
        return result
      } catch (error) {
        const metricAttributes = { 'job.name': job.name, outcome: 'error' }
        span.setAttribute('outcome', 'error')
        jobsProcessed.add(1, metricAttributes)
        logger.emit({
          severityNumber: SeverityNumber.ERROR,
          severityText: 'ERROR',
          body: 'Background job failed',
          attributes: { ...spanAttributes, outcome: 'error' },
        })
        throw error
      } finally {
        jobDuration.record(performance.now() - startedAt, {
          'job.name': job.name,
        })
      }
    },
    { tracer }
  )
}

const globalForWorker = globalThis as typeof globalThis & {
  clippingkkWorker?: Worker
}

export function startWorker() {
  if (globalForWorker.clippingkkWorker) return globalForWorker.clippingkkWorker
  const worker = new Worker(JOB_QUEUE_NAME, processJob, {
    connection: queueConnection(),
    concurrency: Number.parseInt(process.env.WORKER_CONCURRENCY ?? '1', 10),
  })
  globalForWorker.clippingkkWorker = worker
  return worker
}
