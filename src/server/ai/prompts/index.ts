import { hash } from 'node:crypto'

import bookSummary from './book-summary.md' with { type: 'text' }
import commentRewrite from './comment-rewrite.md' with { type: 'text' }
import casual from './comment-styles/casual.md' with { type: 'text' }
import deeper from './comment-styles/deeper.md' with { type: 'text' }
import intriguing from './comment-styles/intriguing.md' with { type: 'text' }
import professional from './comment-styles/professional.md' with { type: 'text' }
import passageNote from './passage-note.md' with { type: 'text' }
import readingPortrait from './reading-portrait.md' with { type: 'text' }
import recommendations from './recommendations.md' with { type: 'text' }
import voice from './voice.md' with { type: 'text' }

/**
 * The prompts live in the Markdown files beside this one. The bundler inlines
 * them as strings, so a deployed server reads no prompt files from disk.
 */

/** What the model is sent: the instructions, then the data as a user message. */
export type BuiltPrompt = {
  system: string[]
  data: unknown
}

/** The `promptId` values of GraphQL `aiEnhanceComment`. */
export const commentStyles: Record<number, string> = {
  1: professional,
  2: deeper,
  3: intriguing,
  4: casual,
}

/** Fills `{{name}}` placeholders, and refuses to send one left unfilled. */
export function renderPrompt(
  template: string,
  values: Record<string, string>
): string {
  return template
    .replaceAll(/\{\{(\w+)\}\}/g, (_, name: string) => {
      const value = values[name]
      if (value === undefined)
        throw new Error(`Prompt placeholder {{${name}}} has no value`)
      return value.trim()
    })
    .trim()
}

function versionOf(...templates: string[]) {
  return hash('sha256', [voice, ...templates].join('\n'), 'base64url').slice(
    0,
    12
  )
}

/**
 * Part of every stored result's fingerprint, so editing a prompt makes readers
 * get the new writing without anyone remembering to bump a cache version.
 */
export const promptVersions = {
  bookSummary: versionOf(bookSummary),
  passageNote: versionOf(passageNote),
  recommendations: versionOf(recommendations),
}

function system(template: string, values: Record<string, string>) {
  return [voice.trim(), renderPrompt(template, values)]
}

export function bookSummaryPrompt(
  language: string,
  data: {
    title: string
    author: string
    highlights: { ref: number; text: string }[]
  }
): BuiltPrompt {
  return { system: system(bookSummary, { language }), data }
}

export function passageNotePrompt(
  language: string,
  data: {
    passage: string
    book: {
      title: string
      author?: string
      year?: string
      summary?: string
    }
  }
): BuiltPrompt {
  return { system: system(passageNote, { language }), data }
}

export type ShelfPromptBook = {
  ref: number
  title: string
  author?: string
  tags?: string[]
  highlightCount: number
  highlights: string[]
}

export function recommendationsPrompt(
  language: string,
  data: {
    shelf: ShelfPromptBook[]
    alreadyRead: string[]
    avoid: string[]
  }
): BuiltPrompt {
  return { system: system(recommendations, { language }), data }
}

export function readingPortraitPrompt(
  language: string,
  highlights: string[]
): BuiltPrompt {
  return { system: system(readingPortrait, { language }), data: { highlights } }
}

export function commentRewritePrompt(
  language: string,
  style: string,
  data: { comment: string; book: string; passage: string }
): BuiltPrompt {
  return { system: system(commentRewrite, { language, style }), data }
}
