import type { McpServer } from '@modelcontextprotocol/server'
import { z } from 'zod'

import { isValidDoubanId } from '@/services/wenqu'
import { dashHref } from '@/utils/profile.utils'

import { isPremium } from '../../billing/premium'
import { booksByDoubanIds } from '../books'
import { profile, readingStats, yearlyReport } from '../queries'
import {
  iso,
  parseDate,
  readOnly,
  result,
  ToolInputError,
  type ToolContext,
} from './context'

const DAY_MS = 24 * 60 * 60 * 1000
/** Daily buckets past this span stop being useful to a model and bloat the context. */
const MAX_DAILY_SPAN_DAYS = 400
const bucket = z.object({ period: z.string(), count: z.number() })

export function registerReportTools(server: McpServer, context: ToolContext) {
  server.registerTool(
    'get_profile',
    {
      title: 'Get my profile',
      description:
        "The reader's ClippingKK profile and library totals: name, bio, Premium status, highlight and book counts, and when they first and last highlighted.",
      inputSchema: z.object({}),
      outputSchema: z.object({
        id: z.number(),
        name: z.string(),
        domain: z.string(),
        avatar: z.string(),
        bio: z.string(),
        createdAt: z.string().nullable(),
        premium: z
          .boolean()
          .nullable()
          .describe('Null when Premium status could not be loaded'),
        clippingsCount: z.number(),
        booksCount: z.number(),
        firstClippingAt: z.string().nullable(),
        lastClippingAt: z.string().nullable(),
        profileUrl: z.string(),
      }),
      annotations: readOnly,
    },
    async () => {
      const [{ user, ...stats }, premium] = await Promise.all([
        profile(context.userId),
        isPremium(context.userId).catch(() => null),
      ])
      return result({
        id: user.id,
        name: user.name,
        domain: user.domain,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: iso(user.createdAt),
        premium,
        clippingsCount: stats.clippingsCount,
        booksCount: stats.booksCount,
        firstClippingAt: iso(stats.firstClippingAt),
        lastClippingAt: iso(stats.lastClippingAt),
        profileUrl: context.url(dashHref(user, 'profile')),
      })
    }
  )

  server.registerTool(
    'get_yearly_report',
    {
      title: 'Get a yearly reading report',
      description:
        "The reader's year in highlights (UTC calendar year): total highlights, books ranked by highlights, a month-by-month count and the busiest day. Use get_reading_stats for the years that have any highlights.",
      inputSchema: z.object({
        year: z.number().int().min(2000).max(2100),
      }),
      outputSchema: z.object({
        year: z.number(),
        totalHighlights: z.number(),
        booksCount: z.number(),
        books: z.array(
          z.object({
            doubanId: z.string().nullable(),
            title: z.string(),
            author: z.string().nullable(),
            clippingsCount: z.number(),
            startReadingAt: z.string().nullable(),
            lastReadingAt: z.string().nullable(),
          })
        ),
        months: z.array(bucket).describe('All 12 months, YYYY-MM'),
        busiestDay: bucket.nullable(),
        reportUrl: z.string(),
      }),
      annotations: readOnly,
    },
    async ({ year }) => {
      const report = await yearlyReport(context.userId, year)
      const meta = await booksByDoubanIds(report.books.map((b) => b.doubanId))
      const counts = new Map(report.months.map((m) => [m.period, m.count]))
      const books = report.books.map((book) => {
        const doubanId = isValidDoubanId(book.doubanId) ? book.doubanId : null
        const found = doubanId ? meta.get(doubanId) : undefined
        return {
          doubanId,
          title: found?.title ?? book.kindleTitle,
          author: found?.author ?? null,
          clippingsCount: book.clippingsCount,
          startReadingAt: iso(book.startReadingAt),
          lastReadingAt: iso(book.lastReadingAt),
        }
      })
      return result({
        year,
        totalHighlights: books.reduce((sum, b) => sum + b.clippingsCount, 0),
        booksCount: books.filter((b) => b.doubanId).length,
        books,
        months: Array.from({ length: 12 }, (_, index) => {
          const period = `${year}-${String(index + 1).padStart(2, '0')}`
          return { period, count: counts.get(period) ?? 0 }
        }),
        busiestDay: report.busiestDay,
        reportUrl: context.url(
          `/report/yearly?uid=${context.userId}&year=${year}`
        ),
      })
    }
  )

  server.registerTool(
    'get_reading_stats',
    {
      title: 'Get reading stats',
      description:
        'How many highlights the reader made per day, month or year (UTC), for charts and trends. Periods without highlights are omitted. Daily stats default to the last 365 days and cover at most 400 days; month and year default to all time. Also lists every year that has highlights.',
      inputSchema: z.object({
        granularity: z.enum(['day', 'month', 'year']).default('month'),
        from: z.string().optional().describe('ISO 8601 date, inclusive'),
        to: z.string().optional().describe('ISO 8601 date, exclusive'),
      }),
      outputSchema: z.object({
        granularity: z.enum(['day', 'month', 'year']),
        from: z.string().nullable(),
        to: z.string().nullable(),
        buckets: z.array(bucket),
        years: z.array(z.number()),
      }),
      annotations: readOnly,
    },
    async ({ granularity, ...args }) => {
      let from = parseDate(args.from)
      const to = parseDate(args.to)
      if (granularity === 'day') {
        const end = to ?? new Date()
        from ??= new Date(end.getTime() - 365 * DAY_MS)
        if (end.getTime() - from.getTime() > MAX_DAILY_SPAN_DAYS * DAY_MS)
          throw new ToolInputError(
            `Daily stats cover at most ${MAX_DAILY_SPAN_DAYS} days; narrow the range or use month granularity.`
          )
      }
      const stats = await readingStats(context.userId, granularity, {
        from,
        to,
      })
      return result({
        granularity,
        from: iso(from),
        to: iso(to),
        ...stats,
      })
    }
  )
}
