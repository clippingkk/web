import {
  chatParamsFromRequestBody,
  toServerSentEventsResponse,
} from '@tanstack/ai'
import { z } from 'zod'

import { optionalUserId } from '../auth'
import { ApiError } from '../errors'
import { requirePremium } from './access'
import { streamBookSummary } from './book-summary'
import { controllerFor, textModel } from './generate'
import { streamPassageNote } from './passage-note'
import { streamRecommendations } from './recommendations'

const language = z.string().trim().max(64).optional()
const force = z.boolean().optional().default(false)

const bookInput = z.object({
  bookId: z
    .string()
    .trim()
    .regex(/^\d{1,32}$/),
  force,
})
const passageInput = z.object({
  clippingId: z.number().int().positive(),
  language,
  force,
})
const recommendationsInput = z.object({ language, force })

const id = z.string().min(1).max(200)
const runIds = z.object({ threadId: id, runId: id })

async function readRun(request: Request) {
  try {
    const { threadId, runId, forwardedProps } = await chatParamsFromRequestBody(
      await request.json()
    )
    return { run: runIds.parse({ threadId, runId }), forwardedProps }
  } catch {
    throw new ApiError('Invalid AI request')
  }
}

function parseInput<TSchema extends z.ZodType>(
  schema: TSchema,
  value: unknown
): z.infer<TSchema> {
  const parsed = schema.safeParse(value)
  if (!parsed.success) throw new ApiError('Invalid AI request')
  return parsed.data
}

export async function aiStreamResponse(
  request: Request,
  kind: 'passage' | 'recommendations' | 'book'
) {
  const userId = await optionalUserId(request)
  await requirePremium(userId)
  textModel()
  const { run, forwardedProps } = await readRun(request)
  const controller = controllerFor(request.signal)
  const { signal } = controller
  const stream =
    kind === 'book'
      ? await streamBookSummary(
          userId,
          parseInput(bookInput, forwardedProps),
          run,
          signal
        )
      : kind === 'passage'
        ? await streamPassageNote(
            userId,
            parseInput(passageInput, forwardedProps),
            run,
            signal
          )
        : await streamRecommendations(
            userId,
            parseInput(recommendationsInput, forwardedProps),
            run,
            signal
          )
  return toServerSentEventsResponse(stream, { abortController: controller })
}
