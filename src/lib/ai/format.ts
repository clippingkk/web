import type {
  BookSummary,
  BookSummaryContext,
  PassageNote,
  Recommendations,
} from './schemas'

/** The note as plain paragraphs, for GraphQL's `aiSummary` and for copying. */
export function passageNoteToText(note: PassageNote) {
  return [
    note.gist,
    note.reading,
    note.context,
    note.terms.map(({ term, meaning }) => `${term}: ${meaning}`).join('\n'),
    note.question,
  ]
    .filter(Boolean)
    .join('\n\n')
}

/** Markdown a reader can paste straight into their notes. */
export function bookSummaryToMarkdown(
  title: string,
  summary: BookSummary,
  context: BookSummaryContext | null | undefined
) {
  const highlights = new Map(
    context?.highlights.map(({ ref, text }) => [ref, text])
  )
  const sections = summary.themes.flatMap((theme) => {
    const quote = highlights.get(theme.highlightRef)
    return [
      `## ${theme.title}`,
      theme.insight,
      ...(quote ? [`> ${quote.replaceAll('\n', '\n> ')}`] : []),
    ]
  })
  return [
    `# ${title}`,
    summary.thesis,
    ...sections,
    `*${summary.question}*`,
  ].join('\n\n')
}

export function recommendationsToMarkdown(
  heading: string,
  recommendations: Recommendations
) {
  return [
    `# ${heading}`,
    recommendations.portrait,
    ...recommendations.picks.map(
      ({ title, author, hook, why }) =>
        `## ${title} · ${author}\n\n${hook}\n\n${why}`
    ),
  ].join('\n\n')
}
