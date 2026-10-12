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

export type ReplyQuota = 'allowed' | 'sender_day' | 'sender_month' | 'global'

/**
 * Counts this email against the sender's daily and monthly allowance and the
 * overall daily one (UTC calendar days and months). The sender's own limits go
 * first, so an address over them can't use up everyone else's allowance. A
 * retry of an email already allowed is not counted again.
 */
export async function claimReplyQuota(
  sender: string,
  emailId: string,
  now = new Date()
): Promise<ReplyQuota> {
  const claimed = `ck:email-import:replied:${emailId}`
  if (await cacheGet(claimed)) return 'allowed'
  const who = createHash('sha256').update(sender).digest('hex')
  const day = now.toISOString().slice(0, 10)
  const month = day.slice(0, 7)
  const prefix = 'ck:email-import:reply'
  if (
    !(
      await rateLimit(
        `${prefix}:d:${who}:${day}`,
        REPLY_LIMITS.senderPerDay,
        2 * DAY
      )
    ).allowed
  )
    return 'sender_day'
  if (
    !(
      await rateLimit(
        `${prefix}:m:${who}:${month}`,
        REPLY_LIMITS.senderPerMonth,
        32 * DAY
      )
    ).allowed
  )
    return 'sender_month'
  if (
    !(await rateLimit(`${prefix}:all:${day}`, REPLY_LIMITS.perDay, 2 * DAY))
      .allowed
  )
    return 'global'
  await cacheSet(claimed, 1, 7 * DAY)
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

function replyHtml(origin: string, clippings: number, notes: number) {
  const link = `<a href="${origin}">${origin.replace(/^https?:\/\//, '')}</a>`
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
