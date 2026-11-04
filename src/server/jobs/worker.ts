import { metrics, trace } from '@opentelemetry/api'
import { logs, SeverityNumber } from '@opentelemetry/api-logs'
import { withSpan } from '@superlog/otel-helpers'
import { Worker, type Job } from 'bullmq'
import { and, eq, isNull, sql } from 'drizzle-orm'

import { getDatabase } from '../db'
import { externalAccounts, users } from '../db/schema'
import { cacheGet } from '../redis'
import { runExport, type ExportCheckpoint } from './export/run'
import {
  AUDITING_EMAIL,
  EMAIL_IMPORT_ATTEMPTS,
  EXPORT_QUEUE_NAME,
  JOB_QUEUE_NAME,
  pendingAccountRemovalKey,
  queueConnection,
  type EmailImportJob,
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

function exportCheckpoint(job: Job) {
  return {
    async read(): Promise<ExportCheckpoint | null> {
      const progress = job.progress
      if (!progress || typeof progress !== 'object') return null
      return progress as ExportCheckpoint
    },
    async write(value: ExportCheckpoint) {
      await job.updateProgress(value)
    },
  }
}

async function handleJob(job: Job) {
  if (job.name === 'export-data') {
    return runExport(job.data as ExportJob, {
      checkpoint: exportCheckpoint(job),
    })
  }

  if (job.name === 'import-email') {
    const { importEmail } = await import('../email-import/import')
    // `attemptsMade` counts the attempts that already failed.
    const attempt = job.attemptsMade + 1
    return importEmail(job.data as EmailImportJob, {
      attempt,
      final: attempt >= (job.opts.attempts ?? EMAIL_IMPORT_ATTEMPTS),
    })
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

export async function processJob(job: Job) {
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
  clippingkkExportWorker?: Worker
}

function listen(
  name: string,
  concurrency: number,
  holder: 'clippingkkWorker' | 'clippingkkExportWorker'
) {
  const existing = globalForWorker[holder]
  if (existing) return existing
  const worker = new Worker(name, processJob, {
    connection: queueConnection(),
    concurrency,
  })
  // Every web process runs the worker, so a Redis outage must only be logged.
  worker.on('error', (error) =>
    logger.emit({
      severityNumber: SeverityNumber.ERROR,
      severityText: 'ERROR',
      body: 'Background worker error',
      attributes: { 'queue.name': name, 'error.message': error.message },
    })
  )
  globalForWorker[holder] = worker
  return worker
}

export function startWorker() {
  const alreadyStarted = Boolean(globalForWorker.clippingkkWorker)
  const worker = listen(
    JOB_QUEUE_NAME,
    Number.parseInt(process.env.WORKER_CONCURRENCY ?? '1', 10),
    'clippingkkWorker'
  )
  listen(
    EXPORT_QUEUE_NAME,
    Number.parseInt(process.env.EXPORT_WORKER_CONCURRENCY ?? '2', 10),
    'clippingkkExportWorker'
  )
  if (alreadyStarted) return worker
  let deleting = false
  const deletionTimer = setInterval(async () => {
    if (deleting) return
    deleting = true
    try {
      await withSpan(
        'auth.account.delete',
        async () =>
          (await import('../gate/deletion')).processPendingDeletions(),
        { tracer }
      )
    } catch {
      logger.emit({
        severityNumber: SeverityNumber.WARN,
        body: 'Account deletion will retry',
        attributes: { outcome: 'retry' },
      })
    } finally {
      deleting = false
    }
  }, 15000)
  deletionTimer.unref()
  worker.on('closed', () => clearInterval(deletionTimer))
  return worker
}
