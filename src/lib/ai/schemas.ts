import { z } from 'zod'

/**
 * The shapes the model must return, shared by the server (`chat`'s
 * `outputSchema`) and the browser (`useChat`'s typed `partial` and `final`).
 *
 * Length limits live in the prompts on purpose. A schema limit would fail the
 * whole paid run when one sentence runs a word long. Instructions for each
 * field belong in `src/server/ai/prompts`.
 */

export const bookSummarySchema = z.object({
  thesis: z.string(),
  themes: z
    .array(
      z.object({
        title: z.string(),
        insight: z.string(),
        highlightRef: z.number(),
      })
    )
    .min(1)
    .max(4),
  question: z.string(),
})
export type BookSummary = z.infer<typeof bookSummarySchema>

/** The highlights a summary was written from, so `highlightRef` resolves to real text. */
export type BookSummaryContext = {
  total: number
  highlights: { ref: number; id: number; text: string }[]
}

export const passageNoteSchema = z.object({
  gist: z.string(),
  reading: z.string(),
  context: z.string().nullable(),
  terms: z.array(z.object({ term: z.string(), meaning: z.string() })).max(3),
  question: z.string(),
})
export type PassageNote = z.infer<typeof passageNoteSchema>

export const RECOMMENDATION_KINDS = [
  'deeper',
  'adjacent',
  'counterpoint',
  'wildcard',
] as const
export type RecommendationKind = (typeof RECOMMENDATION_KINDS)[number]

export const recommendationsSchema = z.object({
  portrait: z.string(),
  picks: z
    .array(
      z.object({
        title: z.string(),
        author: z.string(),
        kind: z.enum(RECOMMENDATION_KINDS),
        hook: z.string(),
        why: z.string(),
        shelfRef: z.number().nullable(),
      })
    )
    .min(3)
    .max(5),
})
export type Recommendations = z.infer<typeof recommendationsSchema>
export type RecommendationPick = Recommendations['picks'][number]

/** The shelf a list was written from, so `shelfRef` resolves to a real book. */
export type RecommendationsContext = {
  shelf: { ref: number; title: string; bookId: string }[]
}

/** The CUSTOM event carrying a result's context, sent before the model's first word. */
export const AI_CONTEXT_EVENT = 'clippingkk.ai.context'
