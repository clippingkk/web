import { Queue } from 'bullmq'

import { getServerEnv } from '../env'

export const JOB_QUEUE_NAME = 'clippingkk-node'
export const AUDITING_EMAIL = 'wechat.mp.aduiting@annatarhe.com'

export function pendingAccountRemovalKey(uid: number) {
  return `worker:user:${uid}:del:cancel`
}

export type ExportJob = {
  destination: 'flomo' | 'notion' | 'mail'
  args: string
  uid: number
}

export type AccountJob = {
  uid: number
}

export function queueConnection() {
  const url = new URL(
    getServerEnv().QUEUE_REDIS_URL ?? getServerEnv().REDIS_URL
  )
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username || undefined,
    password: url.password || undefined,
    db: Number(url.pathname.slice(1) || 0),
    maxRetriesPerRequest: null,
  }
}

const globalForQueue = globalThis as typeof globalThis & {
  clippingkkQueue?: Queue
}

export function getJobQueue() {
  globalForQueue.clippingkkQueue ??= new Queue(JOB_QUEUE_NAME, {
    connection: queueConnection(),
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5_000 },
      removeOnComplete: { age: 24 * 60 * 60, count: 1_000 },
      removeOnFail: { age: 7 * 24 * 60 * 60, count: 5_000 },
    },
  })
  return globalForQueue.clippingkkQueue
}

export function enqueueExport(payload: ExportJob) {
  return getJobQueue().add('export-data', payload)
}

export function enqueueNounCleanup(nounId: number) {
  return getJobQueue().add('noun-cleanup', { nounId })
}

export function enqueueCancelWechatBind(email: string, delay = 60 * 60 * 1000) {
  return getJobQueue().add('cancel-wechat-bind', { email }, { delay })
}

export function enqueueCancelAppleBind(
  appleUnique: string,
  delay = 60 * 60 * 1000
) {
  return getJobQueue().add('cancel-apple-bind', { appleUnique }, { delay })
}

export function enqueueDestroyUser(uid: number, delay = 24 * 60 * 60 * 1000) {
  return getJobQueue().add(
    'destroy-unvalidated-user',
    { uid },
    { delay, jobId: `unvalidated-${uid}` }
  )
}

export function enqueueRemoveAccount(uid: number, delay = 24 * 60 * 60 * 1000) {
  return getJobQueue().add('remove-account', { uid }, { delay })
}

/** An `email.received` event from Resend; see docs/email-import.md. */
export type EmailImportJob = {
  emailId: string
  from: string
  to: string[]
  receivedFor: string[]
  subject: string
  receivedAt: string
}

export function enqueueEmailImport(payload: EmailImportJob) {
  return getJobQueue().add('import-email', payload, {
    // Resend redelivers an event until it is acknowledged; one job per email.
    // BullMQ refuses ':' in custom ids.
    jobId: `email-import-${payload.emailId}`,
    attempts: 5,
    backoff: { type: 'exponential', delay: 30_000 },
  })
}
