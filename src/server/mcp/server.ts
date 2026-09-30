import {
  createMcpHandler,
  McpServer,
  type CallToolResult,
} from '@modelcontextprotocol/server'
import { logs, SeverityNumber } from '@opentelemetry/api-logs'

import { gateConfig } from '../gate/config'
import { mcpUserId } from './auth'
import { registerBookTools } from './tools/books'
import { registerClippingTools } from './tools/clippings'
import { safely, toolContext } from './tools/context'
import { registerReportTools } from './tools/reports'

const logger = logs.getLogger('clippingkk.web.mcp')

const INSTRUCTIONS = `ClippingKK holds the reader's book highlights (clippings) imported from Kindle and WeRead. Every tool reads only the signed-in reader's own library, private highlights included, and nothing here can change it.
- Start with list_books to find a book and its doubanId, then search_clippings with that doubanId for its highlights.
- search_clippings also searches text across all books; page with nextCursor.
- get_yearly_report and get_reading_stats summarise reading over time (UTC).
Quote highlights verbatim and link to their url when citing them.`

type Callback = (...args: unknown[]) => Promise<CallToolResult>

/** A fresh server per request: the protocol is stateless and tools close over the reader. */
export function createClippingkkMcpServer(userId: number) {
  const server = new McpServer(
    { name: 'clippingkk', title: 'ClippingKK', version: '1.0.0' },
    {
      instructions: INSTRUCTIONS,
      // The tool list is the same for every reader, so shared caches may keep it.
      cacheHints: {
        'tools/list': { ttlMs: 60 * 60 * 1000, cacheScope: 'public' },
      },
    }
  )
  // Every tool error passes through `safely`, so internals (SQL, stack
  // details) never reach the client.
  const registerTool = server.registerTool.bind(server)
  server.registerTool = ((name: string, config: never, callback: Callback) =>
    registerTool(
      name,
      config,
      safely(name, callback)
    )) as typeof server.registerTool
  const context = toolContext(userId, gateConfig().appOrigin)
  // Registration order is the `tools/list` order, which the spec asks to keep stable.
  registerReportTools(server, context)
  registerBookTools(server, context)
  registerClippingTools(server, context)
  return server
}

export const mcpHandler = createMcpHandler(
  ({ authInfo }) => createClippingkkMcpServer(mcpUserId(authInfo)),
  {
    legacy: 'stateless',
    onerror: (error) =>
      logger.emit({
        severityNumber: SeverityNumber.WARN,
        severityText: 'WARN',
        body: 'mcp request failed',
        attributes: {
          'error.type': error.name,
          'error.message': error.message,
        },
      }),
  }
)
