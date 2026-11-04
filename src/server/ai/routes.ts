import { toServerSentEventsResponse, type StreamChunk } from '@tanstack/ai'
import { z } from 'zod'

import { optionalUserId } from '../auth'
import { ApiError } from '../errors'
import { aiClipping, requirePremium } from './access'
import { streamBookSummary } from './book-summary'
import { generateAI } from './generate'

const language = z.string().trim().min(1).max(64).default('en')
const book = z.object({
  title: z.string().max(1000),
  author: z.string().max(1000),
  summary: z.string().max(20_000).optional(),
})
const passageSchema = z.object({
  language,
  clippingId: z.number().int().positive(),
  book: book.extend({
    pubdate: z.string().max(100).optional(),
    url: z.string().max(2000).optional(),
    isbn: z.string().max(100).optional(),
  }),
})
const recommendationsSchema = z.object({
  language,
  books: z.array(book).min(1).max(10),
})
const bookSummarySchema = z.object({
  bookId: z
    .string()
    .trim()
    .regex(/^\d{1,32}$/),
  title: z.string().trim().max(1000).optional().default(''),
  author: z.string().trim().max(1000).optional().default(''),
  force: z.boolean().optional().default(false),
})

export async function aiStreamResponse(
  request: Request,
  kind: 'passage' | 'recommendations' | 'book'
) {
  const userId = await optionalUserId(request)
  await requirePremium(userId)
  let body: unknown
  try {
    body = await request.json()
  } catch {
    throw new ApiError('Invalid AI request')
  }
  const envelope = z.object({ forwardedProps: z.unknown() }).safeParse(body)
  if (!envelope.success) throw new ApiError('Invalid AI request')
  const schema =
    kind === 'passage'
      ? passageSchema
      : kind === 'book'
        ? bookSummarySchema
        : recommendationsSchema
  const parsed = schema.safeParse(envelope.data.forwardedProps)
  if (!parsed.success) throw new ApiError('Invalid AI request')
  const controller = new AbortController()
  const abort = () => controller.abort(request.signal.reason)
  request.signal.addEventListener('abort', abort, { once: true })
  if (request.signal.aborted) abort()
  try {
    let stream: AsyncGenerator<StreamChunk>
    if (kind === 'book') {
      stream = await streamBookSummary(
        userId,
        bookSummarySchema.parse(parsed.data),
        controller.signal
      )
    } else if (kind === 'passage') {
      const input = passageSchema.parse(parsed.data)
      stream = generateAI(
        {
          kind: 'passage',
          language: input.language,
          book: input.book,
          passage: (await aiClipping(input.clippingId, userId)).content,
        },
        controller.signal
      )
    } else {
      stream = generateAI(
        {
          kind: 'recommendations',
          ...recommendationsSchema.parse(parsed.data),
        },
        controller.signal
      )
    }
    const cleanupStream = (async function* () {
      try {
        yield* stream
      } finally {
        request.signal.removeEventListener('abort', abort)
      }
    })()
    return toServerSentEventsResponse(cleanupStream, {
      abortController: controller,
    })
  } catch (error) {
    request.signal.removeEventListener('abort', abort)
    throw error
  }
}
