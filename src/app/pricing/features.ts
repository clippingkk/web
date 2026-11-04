/**
 * Feature bullets on the pricing cards. The strings live in
 * `src/locales/{en,zhCN,ko}/pricing.json` and describe what the server
 * actually enforces: unlimited highlights for everyone, AI and webhooks
 * for Premium, a short public RSS feed for everyone and a longer one
 * for Premium. MCP is not Premium-gated.
 */
export const FREE_FEATURES = [
  'highlights',
  'rss',
  'mcp',
  'books',
  'web',
  'widget',
  'privacy',
  'support',
] as const

export const PREMIUM_FEATURES = [
  'highlights',
  'ai',
  'rssExtended',
  'webhooks',
  'mcp',
  'books',
  'web',
  'widget',
  'privacy',
  'prioritySupport',
] as const
