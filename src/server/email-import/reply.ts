import { createHash } from 'node:crypto'

import { MAIL_FROM } from '@/constants/config'

import { getServerEnv } from '../env'
import { getResend } from '../integrations'
import { cacheGet, cacheSet, rateLimit } from '../redis'
import type { KindleNotebook } from './kindle-notebook'

/**
 * A notebook emailed from an address no reader has verified is not imported;
 * the sender gets it back as a JSON file instead. From is easy to forge, so
 * replies are capped per sender and overall: anyone can make ClippingKK write
 * to an address they type in, but only a few times.
 */
export const REPLY_LIMITS = {
  senderPerDay: 5,
  senderPerMonth: 30,
  perDay: 500,
  /** Emails from unverified senders the worker fetches at all, per day. */
  fetchesPerDay: 1000,
} as const

const DAY = 24 * 60 * 60

export interface NotebookJson {
  clippings: {
    title: string
    author: string
    content: string
    pageAt: string
    createdAt: string
  }[]
  notes: {
    title: string
    author: string
    content: string
    pageAt: string
  }[]
}

/** The flat clipping list sent back, dated the way the import would date it. */
export function notebookJson(
  notebooks: readonly KindleNotebook[],
  receivedAt: number
): NotebookJson {
  return {
    clippings: notebooks.flatMap((notebook) =>
      notebook.highlights.map((highlight, index) => ({
        title: notebook.title,
        author: notebook.authors,
        content: highlight.content,
        pageAt: highlight.pageAt,
        createdAt: new Date(receivedAt + index).toISOString(),
      }))
    ),
    notes: notebooks.flatMap((notebook) =>
      notebook.notes.map((note) => ({
        title: notebook.title,
        author: notebook.authors,
        content: note.content,
        pageAt: note.pageAt,
      }))
    ),
  }
}

export type ReplyQuota =
  | 'allowed'
  | 'sender_day'
  | 'sender_month'
  | 'global'
  | 'fetches'

const PREFIX = 'ck:email-import:reply'
const claimedKey = (emailId: string) => `ck:email-import:replied:${emailId}`

/** The sender's daily and monthly counters and the overall daily one (UTC). */
function replyCounters(sender: string, now: Date) {
  const who = createHash('sha256').update(sender).digest('hex')
  const day = now.toISOString().slice(0, 10)
  return [
    [
      'sender_day',
      `${PREFIX}:d:${who}:${day}`,
      REPLY_LIMITS.senderPerDay,
      2 * DAY,
    ],
    [
      'sender_month',
      `${PREFIX}:m:${who}:${day.slice(0, 7)}`,
      REPLY_LIMITS.senderPerMonth,
      32 * DAY,
    ],
    ['global', `${PREFIX}:all:${day}`, REPLY_LIMITS.perDay, 2 * DAY],
  ] as const
}

async function fullCounter(sender: string, now: Date) {
  for (const [limit, key, max] of replyCounters(sender, now))
    if (Number((await cacheGet<number>(key)) ?? 0) >= max) return limit
  return null
}

/**
 * Whether an email from an unverified sender is worth fetching, before its
 * DMARC result or contents are known. It only reads the reply counters, so a
 * forged From can't spend the real sender's allowance, and counts the fetch
 * against a separate daily cap that bounds the work done for strangers.
 */
export async function admitUnverifiedEmail(
  sender: string,
  emailId: string,
  now = new Date()
): Promise<ReplyQuota> {
  if (await cacheGet(claimedKey(emailId))) return 'allowed'
  const full = await fullCounter(sender, now)
  if (full) return full
  const day = now.toISOString().slice(0, 10)
  const fetches = await rateLimit(
    `${PREFIX}:fetch:${day}`,
    REPLY_LIMITS.fetchesPerDay,
    2 * DAY
  )
  return fetches.allowed ? 'allowed' : 'fetches'
}

/**
 * Counts a reply against the sender's daily and monthly allowance and the
 * overall daily one. It runs only once the email has passed DMARC and holds a
 * notebook, so mail that is never answered spends nobody's allowance. All
 * three counters are read first and only bumped when every one has room: a
 * full global allowance doesn't eat into senders' own, nor the reverse. A
 * retry of an email already allowed is not counted again.
 */
export async function claimReplyQuota(
  sender: string,
  emailId: string,
  now = new Date()
): Promise<ReplyQuota> {
  if (await cacheGet(claimedKey(emailId))) return 'allowed'
  const full = await fullCounter(sender, now)
  if (full) return full
  for (const [limit, key, max, ttl] of replyCounters(sender, now))
    // Another job may have taken the last slot since the read above.
    if (!(await rateLimit(key, max, ttl)).allowed) return limit
  await cacheSet(claimedKey(emailId), 1, 7 * DAY)
  return 'allowed'
}

function attachmentName(notebooks: readonly KindleNotebook[]) {
  const title = notebooks.length === 1 ? notebooks[0].title : ''
  // oxlint-disable-next-line no-control-regex -- control characters are what it strips
  const safe = title.replace(/[\\/:*?"<>|\u0000-\u001f]/g, '').trim()
  return `${safe.slice(0, 100) || 'kindle-notebook'}.json`
}

function replyText(origin: string, clippings: number, notes: number) {
  return [
    `Your Kindle notebook is attached as JSON: ${clippings} highlights and ${notes} notes.`,
    '',
    `This address isn't linked to a ClippingKK account, so nothing was imported. To import notebooks straight into your library, sign in at ${origin}, add this address under Settings → Email import, and send the export again.`,
    '',
    `你的 Kindle 笔记本已转换为 JSON 附在邮件中：${clippings} 条划线，${notes} 条笔记。`,
    '',
    `这个邮箱地址尚未关联 ClippingKK 账户，所以没有导入任何内容。登录 ${origin}，在「设置 → 邮件导入」中添加并验证这个地址后再发送一次，即可直接导入到你的书摘。`,
  ].join('\n')
}

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

function replyHtml(origin: string, clippings: number, notes: number) {
  const href = escapeHtml(origin)
  const link = `<a href="${href}">${escapeHtml(origin.replace(/^https?:\/\//, ''))}</a>`
  return `<main style="font-family:system-ui;max-width:560px;margin:auto"><h1>ClippingKK</h1><p>Your Kindle notebook is attached as JSON: ${clippings} highlights and ${notes} notes.</p><p>This address isn't linked to a ClippingKK account, so nothing was imported. To import notebooks straight into your library, sign in at ${link}, add this address under Settings → Email import, and send the export again.</p><hr><p>你的 Kindle 笔记本已转换为 JSON 附在邮件中：${clippings} 条划线，${notes} 条笔记。</p><p>这个邮箱地址尚未关联 ClippingKK 账户，所以没有导入任何内容。登录 ${link}，在「设置 → 邮件导入」中添加并验证这个地址后再发送一次，即可直接导入到你的书摘。</p></main>`
}

/** Replies in the sender's thread with their notebook attached as JSON. */
export async function replyWithNotebookJson(input: {
  to: string
  subject: string
  messageId: string | null
  emailId: string
  notebooks: readonly KindleNotebook[]
  receivedAt: number
}) {
  const json = notebookJson(input.notebooks, input.receivedAt)
  const origin = getServerEnv().APP_ORIGIN
  const original = input.subject.replace(/[\r\n]+/g, ' ').trim()
  const subject = /^re:/i.test(original)
    ? original
    : `Re: ${original || 'Kindle notebook export'}`
  const threaded =
    input.messageId && /^<[^<>\s]+>$/.test(input.messageId)
      ? { 'In-Reply-To': input.messageId, References: input.messageId }
      : undefined
  const { clippings, notes } = json
  const result = await getResend().emails.send(
    {
      from: MAIL_FROM,
      to: input.to,
      subject,
      text: replyText(origin, clippings.length, notes.length),
      html: replyHtml(origin, clippings.length, notes.length),
      headers: threaded,
      attachments: [
        {
          filename: attachmentName(input.notebooks),
          content: Buffer.from(JSON.stringify(json, null, 2)),
          contentType: 'application/json',
        },
      ],
    },
    // A retried job must not send the reply twice.
    { idempotencyKey: `email-import-reply/${input.emailId}` }
  )
  if (result.error) throw new Error(`Resend send: ${result.error.message}`)
  return { clippings: clippings.length, notes: notes.length }
}
