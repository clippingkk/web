import { HTMLElement, type Node, parse, TextNode } from 'node-html-parser'

/**
 * Parser for the HTML "Notebook Export" the Kindle apps email (iOS: Notebook →
 * Export Notebook → Email). The file is a flat list of `noteHeading` /
 * `noteText` pairs under a `bookTitle`, split into chapters by
 * `sectionHeading`s:
 *
 *   <div class="noteHeading">Highlight(<span class="annotation_yellow">yellow</span>) - Location 197</div>
 *   <div class="noteText">…</div>
 *
 * Headings are localised, so a highlight is recognised by its colour span
 * rather than by its wording; a heading without one is the reader's own note.
 * Bookmarks have no text and are skipped.
 */

export interface NotebookHighlight {
  content: string
  pageAt: string
}

export interface NotebookNote {
  content: string
  pageAt: string
  /** Index into `highlights` of the highlight this note follows, if any. */
  highlight: number | null
}

export interface KindleNotebook {
  title: string
  authors: string
  highlights: NotebookHighlight[]
  notes: NotebookNote[]
}

const MARKERS = [
  'bookTitle',
  'authors',
  'sectionHeading',
  'noteHeading',
  'noteText',
] as const
const SELECTOR = MARKERS.map((name) => `.${name}`).join(', ')
const COLOR = /(?:annotation|highlight)_\w+/
const PAGE_WORD = /page|seite|página|pagina|页|頁|페이지|ページ/i
/** Same cut as the My Clippings.txt parser, so both imports name a book alike. */
const TITLE_STOP = /[(（]/
const MAX_TITLE = 1024
const MAX_PAGE_AT = 255

function marker(node: Node) {
  return node instanceof HTMLElement
    ? MARKERS.find((name) => node.classList.contains(name))
    : undefined
}

/**
 * The element's own text. Exports sometimes close a `noteText` with the wrong
 * tag, which nests every following entry inside it; stop at the first nested
 * entry so each one keeps only its own words.
 */
function ownText(element: HTMLElement) {
  let text = ''
  const walk = (node: Node): boolean => {
    for (const child of node.childNodes) {
      if (marker(child)) return false
      if (child instanceof TextNode) text += child.text
      else if (child instanceof HTMLElement) {
        if (child.tagName === 'BR') text += '\n'
        else if (!walk(child)) return false
      }
    }
    return true
  }
  walk(element)
  return text
}

const oneLine = (value: string) => value.replace(/\s+/g, ' ').trim()

/** Trims every line and drops the blank ones the export's indentation adds. */
function paragraphs(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')
}

function number(part: string | undefined) {
  // Locations past 999 may carry a thousands separator ("Location 1,783").
  const match = part?.match(/\d[\d,.\s]*\d|\d/)
  return match ? match[0].replace(/\D/g, '') : ''
}

/**
 * `pageAt` in the format the My Clippings.txt parser stores: the bare page
 * number when the heading has one, otherwise `#<location>`.
 *
 *   "Highlight(yellow) - Location 197"             → "#197"
 *   "Highlight (yellow) - Page 12 · Location 197"  → "12"
 *   "标注(黄色) - 第 12 页·位置 197"                  → "12"
 */
export function headingPageAt(heading: string) {
  const text = oneLine(heading)
  const separator = text.lastIndexOf(' - ')
  let position = separator === -1 ? text : text.slice(separator + 3)
  // Some exports prefix the chapter: "… - Chapter 1 > Page 3 · Location 45".
  position = position.slice(position.lastIndexOf('>') + 1)
  const parts = position.split('·')
  let page = ''
  let location = ''
  if (parts.length > 1) {
    page = number(parts[0])
    location = number(parts[parts.length - 1])
  } else if (PAGE_WORD.test(position)) {
    page = number(position)
  } else {
    location = number(position)
  }
  if (page) return page
  return location ? `#${location}` : ''
}

function bookTitle(raw: string) {
  return oneLine(raw).split(TITLE_STOP)[0].trim().slice(0, MAX_TITLE)
}

/** The notebook in `html`, or null when it isn't a Kindle notebook export. */
export function parseKindleNotebook(html: string): KindleNotebook | null {
  const root = parse(html, {
    comment: false,
    blockTextElements: { script: false, style: false },
  })
  const notebook: KindleNotebook = {
    title: '',
    authors: '',
    highlights: [],
    notes: [],
  }
  let heading: { pageAt: string; highlight: boolean } | null = null
  // The highlight a note right after it annotates; reset by anything else.
  let lastHighlight: number | null = null
  let sawHeading = false

  for (const element of root.querySelectorAll(SELECTOR)) {
    switch (marker(element)) {
      case 'bookTitle':
        notebook.title ||= bookTitle(ownText(element))
        break
      case 'authors':
        notebook.authors ||= oneLine(ownText(element))
        break
      case 'sectionHeading':
        heading = null
        lastHighlight = null
        break
      case 'noteHeading':
        sawHeading = true
        // A heading with no text after it (a bookmark) breaks the adjacency.
        if (heading) lastHighlight = null
        heading = {
          pageAt: headingPageAt(ownText(element)).slice(0, MAX_PAGE_AT),
          highlight: element
            .querySelectorAll('span')
            .some((span) => COLOR.test(span.getAttribute('class') ?? '')),
        }
        break
      case 'noteText': {
        if (!heading) break
        const content = paragraphs(ownText(element))
        const { pageAt, highlight } = heading
        heading = null
        if (!content) {
          lastHighlight = null
        } else if (highlight) {
          lastHighlight = notebook.highlights.push({ content, pageAt }) - 1
        } else {
          notebook.notes.push({ content, pageAt, highlight: lastHighlight })
          lastHighlight = null
        }
        break
      }
    }
  }

  if (!sawHeading || !notebook.title) return null
  return notebook
}
