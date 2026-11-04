import {
  APIErrorCode,
  isHTTPResponseError,
  type BlockObjectRequest,
  type Client,
} from '@notionhq/client'

import { getNotion } from '../../integrations'
import {
  createRateGate,
  retryAfterMs,
  transientStatus,
  withBackoff,
  type RetryDecision,
} from './retry'
import type { HighlightRow } from './rows'

/** Notion accepts at most 100 children per create or append. */
export const NOTION_BLOCKS_PER_REQUEST = 100
/** One page per book, split again when a single book would be a giant page. */
export const NOTION_BLOCKS_PER_PAGE = 400
/** Stay under Notion's average of 3 requests per second. */
export const NOTION_MIN_INTERVAL_MS = 350

const TEXT_LIMIT = 2_000

export type NotionTarget =
  | {
      kind: 'database'
      dataSourceId: string
      titleProperty: string
      authorProperty?: string
    }
  | { kind: 'page'; pageId: string }

export type NotionCalls = {
  resolve: (id: string) => Promise<NotionTarget>
  createPage: (input: {
    target: NotionTarget
    title: string
    author?: string
    children: BlockObjectRequest[]
  }) => Promise<{ id: string }>
  append: (pageId: string, children: BlockObjectRequest[]) => Promise<void>
}

type NotionRuntime = {
  sleep: (ms: number) => Promise<void>
  now: () => number
  intervalMs?: number
  onRetry?: (info: { attempt: number; delayMs: number; error: unknown }) => void
}

function richText(value: string) {
  const source = value.trim() ? value : ' '
  const items: { type: 'text'; text: { content: string } }[] = []
  for (
    let index = 0;
    index < source.length && items.length < 100;
    index += TEXT_LIMIT
  ) {
    items.push({
      type: 'text',
      text: { content: source.slice(index, index + TEXT_LIMIT) },
    })
  }
  return items
}

function quoteBlocks(content: string): BlockObjectRequest[] {
  const source = content.trim() ? content : ' '
  const parts: string[] = []
  for (let index = 0; index < source.length; index += TEXT_LIMIT) {
    parts.push(source.slice(index, index + TEXT_LIMIT))
  }
  const blocks: BlockObjectRequest[] = []
  for (let index = 0; index < parts.length; index += 100) {
    blocks.push({
      object: 'block',
      type: 'quote',
      quote: {
        rich_text: parts.slice(index, index + 100).map((part) => ({
          type: 'text',
          text: { content: part },
        })),
      },
    })
  }
  return blocks
}

export function highlightBlocks(row: HighlightRow): BlockObjectRequest[] {
  return [
    {
      object: 'block',
      type: 'heading_3',
      heading_3: {
        rich_text: richText((row.pageAt || 'Highlight').slice(0, TEXT_LIMIT)),
      },
    },
    ...quoteBlocks(row.content),
  ]
}

export function chunkBlocks<T>(blocks: readonly T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let index = 0; index < blocks.length; index += size) {
    chunks.push(blocks.slice(index, index + size))
  }
  return chunks
}

function responseHeader(error: unknown, name: string) {
  if (
    !isHTTPResponseError(error) ||
    !error.headers ||
    typeof error.headers !== 'object'
  )
    return undefined
  const headers = error.headers as { get?: (name: string) => unknown }
  if (typeof headers.get === 'function') {
    const value = headers.get(name)
    return typeof value === 'string' ? value : undefined
  }
  for (const [key, value] of Object.entries(
    error.headers as Record<string, unknown>
  )) {
    if (key.toLowerCase() === name && typeof value === 'string') return value
  }
  return undefined
}

export function notionRetry(
  error: unknown,
  now = Date.now()
): RetryDecision | null {
  if (!isHTTPResponseError(error)) return null
  const decision = transientStatus(error.status)
  if (!decision) return null
  return {
    retryAfterMs: retryAfterMs(responseHeader(error, 'retry-after'), now),
  }
}

/** A page id passed to the database endpoint, or the reverse. Try the other. */
export function notionTargetMiss(error: unknown) {
  if (!isHTTPResponseError(error)) return false
  return (
    error.status === 400 ||
    error.status === 404 ||
    error.code === APIErrorCode.ObjectNotFound ||
    error.code === APIErrorCode.ValidationError ||
    error.code === APIErrorCode.InvalidRequestURL
  )
}

function titleProperty(
  properties: Record<string, { type?: string }> | undefined
) {
  return (
    Object.entries(properties ?? {}).find(
      ([, property]) => property.type === 'title'
    )?.[0] ?? 'Name'
  )
}

function authorProperty(
  properties: Record<string, { type?: string }> | undefined
) {
  return Object.entries(properties ?? {}).find(
    ([name, property]) =>
      property.type === 'rich_text' && /author|作者|저자/i.test(name)
  )?.[0]
}

export function notionCalls(
  client: Client,
  runtime: NotionRuntime
): NotionCalls {
  const gate = createRateGate(
    runtime.intervalMs ?? NOTION_MIN_INTERVAL_MS,
    runtime.sleep,
    runtime.now
  )
  const call = <T>(run: () => Promise<T>) =>
    withBackoff(
      async () => {
        await gate.wait()
        try {
          return await run()
        } catch (error) {
          const decision = notionRetry(error, runtime.now())
          if (decision?.retryAfterMs) gate.blockFor(decision.retryAfterMs)
          throw error
        }
      },
      {
        sleep: runtime.sleep,
        isRetryable: (error) => notionRetry(error, runtime.now()),
        onRetry: runtime.onRetry,
      }
    )

  return {
    async resolve(id) {
      let database: Awaited<ReturnType<Client['databases']['retrieve']>>
      try {
        database = await call(() =>
          client.databases.retrieve({ database_id: id })
        )
      } catch (error) {
        if (!notionTargetMiss(error)) throw error
        await call(() => client.pages.retrieve({ page_id: id }))
        return { kind: 'page' as const, pageId: id }
      }
      if (database.object !== 'database' || !('data_sources' in database)) {
        throw new Error('Notion database response was incomplete')
      }
      const dataSourceId = database.data_sources[0]?.id
      if (!dataSourceId) throw new Error('Notion database has no data source')
      const source = await call(() =>
        client.dataSources.retrieve({ data_source_id: dataSourceId })
      )
      const properties = 'properties' in source ? source.properties : undefined
      return {
        kind: 'database' as const,
        dataSourceId,
        titleProperty: titleProperty(properties),
        authorProperty: authorProperty(properties),
      }
    },
    async createPage({ target, title, author, children }) {
      const sliced = title.slice(0, TEXT_LIMIT) || 'Untitled'
      const titleValue = {
        type: 'title' as const,
        title: [{ type: 'text' as const, text: { content: sliced } }],
      }
      const properties =
        target.kind === 'page'
          ? { title: titleValue }
          : {
              [target.titleProperty]: titleValue,
              ...(target.authorProperty && author
                ? {
                    [target.authorProperty]: {
                      type: 'rich_text' as const,
                      rich_text: richText(author),
                    },
                  }
                : {}),
            }
      const page = await call(() =>
        client.pages.create({
          parent:
            target.kind === 'page'
              ? { type: 'page_id', page_id: target.pageId }
              : { type: 'data_source_id', data_source_id: target.dataSourceId },
          properties,
          children,
        })
      )
      return { id: page.id }
    },
    async append(pageId, children) {
      await call(() =>
        client.blocks.children.append({ block_id: pageId, children })
      )
    },
  }
}

export function notionClient(token: string) {
  return getNotion(token)
}
