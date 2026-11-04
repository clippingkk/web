import type { HighlightRow } from './rows'

export type BookNote = {
  title: string
  author: string
  highlights: Pick<HighlightRow, 'content' | 'pageAt'>[]
}

function yamlString(value: string) {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, ' ')}"`
}

/** One Obsidian note: YAML frontmatter plus a blockquote per highlight. */
export function renderBookMarkdown(book: BookNote) {
  const body = book.highlights
    .map((highlight) => {
      const quote = highlight.content
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n')
      return highlight.pageAt ? `${quote}\n\n${highlight.pageAt}` : quote
    })
    .join('\n\n---\n\n')
  const note = [
    '---',
    `title: ${yamlString(book.title)}`,
    `author: ${yamlString(book.author)}`,
    `highlights: ${book.highlights.length}`,
    '---',
    '',
    body,
  ].join('\n')
  return body ? `${note}\n` : note
}

/** Vault-relative path. Collisions get the book id so two books can share a title. */
export function vaultFileName(
  title: string,
  bookId: string,
  used: Set<string>
) {
  let cleaned = ''
  for (const char of title) {
    const code = char.codePointAt(0) ?? 0
    cleaned += code < 32 || '\\/:*?"<>|'.includes(char) ? ' ' : char
  }
  cleaned = cleaned.replace(/\s+/g, ' ').trim().slice(0, 80)
  const base = cleaned || 'untitled'
  let name = `clippingkk/${base}.md`
  if (used.has(name.toLowerCase())) {
    const suffix = bookId && bookId !== '0' ? bookId : String(used.size + 1)
    name = `clippingkk/${base} (${suffix}).md`
  }
  used.add(name.toLowerCase())
  return name
}

/** The single-file mail export. One section per highlight, oldest first. */
export function renderMailMarkdown(rows: readonly HighlightRow[]) {
  return rows
    .map((row) => `# ${row.title}\n\n${row.content}\n\n${row.pageAt}\n`)
    .join('\n---\n\n')
}
