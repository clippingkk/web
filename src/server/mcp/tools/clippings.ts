import type { McpServer } from '@modelcontextprotocol/server'
import { z } from 'zod'

import { clippingHref } from '@/utils/profile.utils'

import { sourceToEnum } from '../../clippings/queries'
import { booksByDoubanIds } from '../books'
import {
  decodeCursor,
  ownClipping,
  searchClippings,
  type ClippingRow,
} from '../queries'
import {
  iso,
  parseDate,
  readOnly,
  result,
  ToolInputError,
  type ToolContext,
} from './context'

const clippingSchema = z.object({
  id: z.number(),
  content: z.string(),
  bookTitle: z
    .string()
    .describe('The book title from Wenqu, or the raw Kindle title'),
  doubanId: z
    .string()
    .nullable()
    .describe('Null when the clipping never matched a book'),
  pageAt: z.string().describe('Location as exported by the device'),
  source: z.enum(['kindle', 'weread', 'unknown']),
  visible: z.boolean().describe('Whether the clipping is public'),
  createdAt: z.string().nullable(),
  url: z.string(),
})

async function present(context: ToolContext, rows: readonly ClippingRow[]) {
  const user = await context.user()
  const books = await booksByDoubanIds(rows.map((row) => row.bookId))
  return rows.map((row) => {
    const matched = row.bookId && row.bookId !== '0' ? row.bookId : null
    return {
      id: row.id,
      content: row.content,
      bookTitle: (matched && books.get(matched)?.title) || row.title,
      doubanId: matched,
      pageAt: row.pageAt,
      source: sourceToEnum(row.source) as z.infer<
        typeof clippingSchema
      >['source'],
      visible: row.visible,
      createdAt: iso(row.createdAt),
      url: context.url(clippingHref(user, row.id)),
    }
  })
}

export function registerClippingTools(server: McpServer, context: ToolContext) {
  server.registerTool(
    'search_clippings',
    {
      title: 'Search highlights',
      description:
        "Search the reader's own highlights (clippings). Every filter is optional and they combine with AND; with no filters this lists the latest highlights. Use `doubanId` from list_books to scope to one book. Results are paged: pass `nextCursor` back as `cursor` for more.",
      inputSchema: z.object({
        query: z
          .string()
          .min(1)
          .max(200)
          .optional()
          .describe(
            'Case-insensitive substring matched against the highlight text and the book title'
          ),
        doubanId: z
          .string()
          .max(64)
          .optional()
          .describe('Only highlights from this book (Douban id)'),
        bookTitle: z
          .string()
          .min(1)
          .max(200)
          .optional()
          .describe(
            'Case-insensitive substring of the Kindle book title; works for books without a Douban match'
          ),
        source: z.enum(['kindle', 'weread', 'unknown']).optional(),
        visibility: z.enum(['all', 'public', 'private']).default('all'),
        from: z
          .string()
          .optional()
          .describe('Created at or after this date (ISO 8601, UTC)'),
        to: z
          .string()
          .optional()
          .describe('Created before this date (ISO 8601, UTC)'),
        order: z.enum(['newest', 'oldest']).default('newest'),
        limit: z.number().int().min(1).max(100).default(20),
        cursor: z.string().max(200).optional(),
      }),
      outputSchema: z.object({
        total: z.number().describe('Matches across all pages'),
        items: z.array(clippingSchema),
        nextCursor: z.string().nullable(),
      }),
      annotations: readOnly,
    },
    async (args) => {
      const cursor = args.cursor ? decodeCursor(args.cursor) : null
      if (args.cursor && !cursor) throw new ToolInputError('Invalid cursor')
      const found = await searchClippings(
        context.userId,
        {
          query: args.query,
          doubanId: args.doubanId,
          bookTitle: args.bookTitle,
          source: args.source,
          visibility: args.visibility,
          from: parseDate(args.from),
          to: parseDate(args.to),
        },
        { order: args.order, limit: args.limit, cursor }
      )
      return result({
        total: found.total,
        items: await present(context, found.items),
        nextCursor: found.nextCursor,
      })
    }
  )

  server.registerTool(
    'get_clipping',
    {
      title: 'Get a highlight',
      description: "One of the reader's own highlights, by id.",
      inputSchema: z.object({ id: z.number().int().positive() }),
      outputSchema: clippingSchema,
      annotations: readOnly,
    },
    async ({ id }) => {
      const [clipping] = await present(context, [
        await ownClipping(context.userId, id),
      ])
      return result(clipping)
    }
  )
}
