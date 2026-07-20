import {
  bigint,
  bigserial,
  boolean,
  index,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'

const id = () => bigserial('id', { mode: 'number' }).primaryKey()
const createdAt = () =>
  timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
const updatedAt = () =>
  timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
const int = (name: string) => bigint(name, { mode: 'number' })

export const users = pgTable(
  'users',
  {
    id: id(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 255 }).notNull().default(''),
    pwd: varchar('pwd', { length: 255 }).notNull(),
    avatar: varchar('avatar', { length: 1024 }).notNull().default(''),
    checked: boolean('checked').notNull(),
    bio: varchar('bio', { length: 2048 }).notNull().default(''),
    domain: varchar('domain', { length: 255 }).notNull().default(''),
    stripeCustomerId: varchar('stripe_customer_id', { length: 255 })
      .notNull()
      .default(''),
    premiumEndAt: timestamp('premium_end_at', { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [uniqueIndex('users_email_key').on(table.email)]
)

export const clippings = pgTable(
  'clippings',
  {
    id: id(),
    title: varchar('title', { length: 1024 }).notNull(),
    content: text('content').notNull(),
    bookId: varchar('book_id', { length: 255 }).notNull().default(''),
    pageAt: varchar('page_at', { length: 255 }).notNull().default(''),
    dataId: varchar('data_id', { length: 255 }).notNull(),
    seq: int('seq').notNull().default(0),
    createdBy: int('created_by').notNull(),
    visible: boolean('visible').notNull().default(true),
    nouns: jsonb('nouns').$type<number[]>().notNull().default([]),
    source: int('source').notNull().default(1),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('clipping_data_iduq').on(table.dataId),
    index('clippings_created_by_idx').on(table.createdBy),
    index('clippings_book_id_idx').on(table.bookId),
  ]
)

export const collections = pgTable('collections', {
  id: id(),
  clipId: int('clip_id').notNull(),
  userId: int('user_id').notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
})

export const comments = pgTable('comments', {
  id: id(),
  belongsTo: int('belongs_to').notNull(),
  createdBy: int('created_by').notNull(),
  content: text('content').notNull(),
  enabled: boolean('enabled').notNull().default(true),
  replyTo: int('reply_to').notNull().default(-1),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
})

export const devices = pgTable('devices', {
  id: id(),
  deviceId: varchar('device_id', { length: 255 }).notNull(),
  deviceName: varchar('device_name', { length: 255 }).notNull(),
  appVersion: varchar('app_version', { length: 255 }).notNull(),
  iosDeviceToken: varchar('ios_device_token', { length: 255 }).notNull(),
  os: varchar('os', { length: 32 }).notNull(),
  osVersion: varchar('os_version', { length: 255 }).notNull(),
  userId: int('user_id').notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
})

export const externalAccounts = pgTable(
  'external_accounts',
  {
    id: id(),
    userId: int('user_id').notNull(),
    wechatOpenId: varchar('wechat_openid', { length: 255 })
      .notNull()
      .default(''),
    wechatUnionId: varchar('wechat_unionid', { length: 255 })
      .notNull()
      .default(''),
    githubAccessToken: varchar('github_access_token', { length: 1024 })
      .notNull()
      .default(''),
    appleUnique: varchar('apple_unique', { length: 255 }).notNull().default(''),
  },
  (table) => [uniqueIndex('external_accounts_user_id_key').on(table.userId)]
)

export type NftItem = {
  token_address: string
  token_id: string
  owner_of: string
  block_number: string
  block_number_minted: string
  token_hash: string
  amount: string
  contract_type: string
  name: string
  symbol: string
  token_uri: string
  metadata: string
  last_token_uri_sync: string
  last_metadata_sync: string
}

export const nfts = pgTable(
  'nfts',
  {
    id: id(),
    address: varchar('address', { length: 255 }).notNull(),
    owner: int('owner').notNull(),
    chain: varchar('chain', { length: 32 }).notNull(),
    nfts: jsonb('nfts').$type<NftItem[]>().notNull().default([]),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('nfts_address_chain_key').on(table.address, table.chain),
  ]
)

export const nouns = pgTable('nouns', {
  id: id(),
  noun: varchar('noun', { length: 64 }).notNull(),
  bookId: varchar('book_id', { length: 255 }).notNull().default(''),
  clippingId: int('clipping_id').notNull().default(-1),
  content: text('content').notNull().default(''),
  updaters: jsonb('updaters').$type<number[]>().notNull().default([]),
  scope: int('scope').notNull().default(0),
  userNouns: int('user_nouns'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
})

export const orders = pgTable('orders', {
  id: id(),
  orderId: varchar('order_id', { length: 255 }).notNull(),
  sku: varchar('sku', { length: 255 }).notNull(),
  subscriptionId: varchar('subscription_id', { length: 255 })
    .notNull()
    .default(''),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }).notNull(),
  orderCreatedAt: timestamp('order_created_at', {
    withTimezone: true,
  }).defaultNow(),
  amount: real('amount').notNull(),
  currency: varchar('currency', { length: 32 }).notNull(),
  userOrders: int('user_orders'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
})

export const reactions = pgTable('reactions', {
  id: id(),
  symbol: varchar('symbol', { length: 255 }).notNull(),
  creator: int('creator').notNull(),
  target: int('target').notNull().default(0),
  targetId: int('target_id').notNull().default(-1),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
})

export const userConnects = pgTable(
  'user_connects',
  {
    id: id(),
    owner: int('owner').notNull(),
    target: int('target').notNull(),
    connectType: int('connect_type').notNull().default(0),
    reason: varchar('reason', { length: 255 }).notNull().default('user will'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('user_connects_owner_target_connect_type_key').on(
      table.owner,
      table.target,
      table.connectType
    ),
  ]
)

export const web3Addresses = pgTable(
  'web3_addresses',
  {
    id: id(),
    address: varchar('address', { length: 255 }).notNull(),
    userAddress: int('user_address'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [uniqueIndex('web3_addresses_address_key').on(table.address)]
)

export const webHooks = pgTable(
  'web_hooks',
  {
    id: id(),
    owner: int('owner').notNull(),
    step: int('step').notNull(),
    hookUrl: varchar('hook_url', { length: 2048 }).notNull(),
  },
  (table) => [
    uniqueIndex('web_hooks_owner_step_key').on(table.owner, table.step),
  ]
)

export const webHookRecords = pgTable('web_hook_records', {
  id: id(),
  requestMethod: varchar('request_method', { length: 16 })
    .notNull()
    .default('GET'),
  requestUrl: varchar('request_url', { length: 2048 }).notNull(),
  requestHeaders: jsonb('request_headers')
    .$type<Record<string, string>>()
    .notNull()
    .default({}),
  requestBody: text('request_body').notNull().default(''),
  requestIp: varchar('request_ip', { length: 255 }).notNull().default(''),
  responseStatus: int('response_status').notNull().default(0),
  responseHeaders: text('response_headers').notNull().default('{}'),
  responseBody: text('response_body').notNull().default(''),
  startTime: timestamp('start_time', { withTimezone: true })
    .notNull()
    .defaultNow(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull().defaultNow(),
  errorMessage: varchar('error_message', { length: 2048 })
    .notNull()
    .default(''),
  webHookRecords: int('web_hook_records'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
})

export type User = typeof users.$inferSelect
export type Clipping = typeof clippings.$inferSelect
export type Comment = typeof comments.$inferSelect
export type Noun = typeof nouns.$inferSelect
export type Reaction = typeof reactions.$inferSelect
