import { passageNoteToText } from '@/lib/ai/format'
import { passageNoteSchema, type PassageNote } from '@/lib/ai/schemas'
import { shortBookTitle } from '@/lib/book-match'
import { isValidDoubanId } from '@/services/wenqu'

import type { Clipping } from '../db/schema'
import { aiClipping } from './access'
import { loadBooks } from './book-facts'
import { clipChars } from './book-highlights'
import { outputLanguage } from './language'
import { passageNotePrompt, promptVersions } from './prompts'
import {
  fingerprintOf,
  resultObject,
  resultStream,
  storedResult,
  type AIResult,
  type ResultTask,
} from './results'
import { logResultWarning } from './telemetry'

const USE_CASE = 'passage_note'
const PASSAGE_CHARS = 2_000
const BOOK_SUMMARY_CHARS = 600

type Passage = Pick<Clipping, 'id' | 'title' | 'content' | 'bookId'>

// Per reader, so one reader asking again never replaces the note another sees.
function cacheKey(userId: number, clippingId: number, tag: string) {
  return `ai:passage-note:v2:${userId}:${clippingId}:${tag}`
}

function fingerprintFor(content: string) {
  return fingerprintOf(promptVersions.passageNote, content)
}

function passageTask(
  userId: number,
  clipping: Passage,
  rawLanguage: string | null | undefined,
  force: boolean,
  signal: AbortSignal
): ResultTask<typeof passageNoteSchema, null> {
  const language = outputLanguage(rawLanguage)
  return {
    useCase: USE_CASE,
    key: cacheKey(userId, clipping.id, language.tag),
    schema: passageNoteSchema,
    fingerprint: fingerprintFor(clipping.content),
    force,
    signal,
    attributes: { 'user.id': userId, 'clipping.id': clipping.id },
    prepare: async () => {
      const book = isValidDoubanId(clipping.bookId)
        ? (await loadBooks([clipping.bookId])).get(clipping.bookId)
        : undefined
      return {
        context: null,
        prompt: passageNotePrompt(language.name, {
          passage: clipChars(clipping.content.trim(), PASSAGE_CHARS),
          book: {
            title: clipChars(
              shortBookTitle(book?.title || clipping.title),
              300
            ),
            author: book?.author,
            year: book?.pubdate?.match(/\d{4}/)?.[0],
            summary: book?.summary
              ? clipChars(book.summary, BOOK_SUMMARY_CHARS)
              : undefined,
          },
        }),
      }
    },
  }
}

/** A stored note for this passage, so a return visit shows it without a click or a bill. */
export async function cachedPassageNote(
  userId: number,
  clipping: { id: number; content: string },
  rawLanguage?: string | null
): Promise<AIResult<PassageNote, null> | null> {
  try {
    return await storedResult(
      USE_CASE,
      cacheKey(userId, clipping.id, outputLanguage(rawLanguage).tag),
      passageNoteSchema,
      fingerprintFor(clipping.content)
    )
  } catch {
    logResultWarning('passage note cache lookup failed', USE_CASE)
    return null
  }
}

export async function streamPassageNote(
  userId: number,
  input: { clippingId: number; language?: string; force: boolean },
  run: { threadId: string; runId: string },
  signal: AbortSignal
) {
  const clipping = await aiClipping(input.clippingId, userId)
  return resultStream(
    passageTask(userId, clipping, input.language, input.force, signal),
    run
  )
}

/** The note as prose, for GraphQL's `Clipping.aiSummary`. */
export async function passageNoteText(
  userId: number,
  clipping: Passage,
  rawLanguage: string | null | undefined,
  signal: AbortSignal
) {
  const { object } = await resultObject(
    passageTask(userId, clipping, rawLanguage, false, signal)
  )
  return passageNoteToText(object)
}
