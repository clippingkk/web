import type { McpServer } from '@modelcontextprotocol/server'
import { z } from 'zod'

import { bookHref } from '@/utils/profile.utils'

import { assertFound } from '../../errors'
import { booksByDoubanIds } from '../books'
import { bookReading, listBooks, listUnmatchedBooks } from '../queries'
import { iso, readOnly, result, type ToolContext } from './context'

const readingFields = {
  clippingsCount: z.number(),
  startReadingAt: z.string().nullable().describe('First highlight'),
  lastReadingAt: z.string().nullable().describe('Latest highlight'),
}

export function registerBookTools(server: McpServer, context: ToolContext) {
  server.registerTool(
    'list_books',
    {
      title: 'List books',
      description:
        "The reader's books, most recently highlighted first, with highlight counts and titles. `doubanId` feeds search_clippings and get_book. With `includeUnmatched`, highlights whose Kindle title never matched a book are listed too, grouped by that title (search them with search_clippings `bookTitle`).",
      inputSchema: z.object({
        limit: z.number().int().min(1).max(100).default(30),
        offset: z.number().int().min(0).default(0),
        includeUnmatched: z.boolean().default(false),
      }),
      outputSchema: z.object({
        books: z.array(
          z.object({
            doubanId: z.string(),
            title: z.string().nullable(),
            author: z.string().nullable(),
            cover: z.string().nullable(),
            url: z.string(),
            ...readingFields,
          })
        ),
        unmatched: z
          .array(z.object({ kindleTitle: z.string(), ...readingFields }))
          .optional(),
      }),
      annotations: readOnly,
    },
    async ({ limit, offset, includeUnmatched }) => {
      const pagination = { limit, offset }
      const [rows, unmatched, user] = await Promise.all([
        listBooks(context.userId, pagination),
        includeUnmatched
          ? listUnmatchedBooks(context.userId, pagination)
          : undefined,
        context.user(),
      ])
      const meta = await booksByDoubanIds(rows.map((row) => row.doubanId))
      return result({
        books: rows.map((row) => ({
          doubanId: row.doubanId,
          title: meta.get(row.doubanId)?.title ?? null,
          author: meta.get(row.doubanId)?.author ?? null,
          cover: meta.get(row.doubanId)?.cover ?? null,
          url: context.url(bookHref(user, row.doubanId)),
          clippingsCount: row.clippingsCount,
          startReadingAt: iso(row.startReadingAt),
          lastReadingAt: iso(row.lastReadingAt),
        })),
        ...(unmatched && {
          unmatched: unmatched.map((row) => ({
            kindleTitle: row.title,
            clippingsCount: row.clippingsCount,
            startReadingAt: iso(row.startReadingAt),
            lastReadingAt: iso(row.lastReadingAt),
          })),
        }),
      })
    }
  )

  server.registerTool(
    'get_book',
    {
      title: 'Get a book',
      description:
        "Details of a book the reader has highlighted: Wenqu/Douban metadata (author, press, rating, summary, tags) plus the reader's highlight count and dates. Use search_clippings with the same doubanId for the highlights.",
      inputSchema: z.object({ doubanId: z.string().min(1).max(64) }),
      outputSchema: z.object({
        doubanId: z.string(),
        title: z.string(),
        author: z.string().nullable(),
        cover: z.string().nullable(),
        press: z.string().nullable(),
        pubdate: z.string().nullable(),
        isbn: z.string().nullable(),
        rating: z.number().nullable(),
        totalPages: z.number().nullable(),
        tags: z.array(z.string()),
        summary: z.string().nullable(),
        doubanUrl: z.string().nullable(),
        url: z.string(),
        ...readingFields,
      }),
      annotations: readOnly,
    },
    async ({ doubanId }) => {
      const reading = await bookReading(context.userId, doubanId)
      if (!reading?.clippingsCount) assertFound(null, 'book not found')
      const [meta, user] = await Promise.all([
        booksByDoubanIds([doubanId]).then((found) => found.get(doubanId)),
        context.user(),
      ])
      return result({
        doubanId,
        title: meta?.title ?? reading.kindleTitle ?? doubanId,
        author: meta?.author ?? null,
        cover: meta?.cover ?? null,
        press: meta?.press ?? null,
        pubdate: meta?.pubdate ?? null,
        isbn: meta?.isbn ?? null,
        rating: meta?.rating ?? null,
        totalPages: meta?.totalPages ?? null,
        tags: meta?.tags ?? [],
        summary: meta?.summary ?? null,
        doubanUrl: meta?.doubanUrl ?? null,
        url: context.url(bookHref(user, doubanId)),
        clippingsCount: reading.clippingsCount,
        startReadingAt: iso(reading.startReadingAt),
        lastReadingAt: iso(reading.lastReadingAt),
      })
    }
  )
}
