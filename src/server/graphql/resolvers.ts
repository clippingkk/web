import { randomBytes, randomInt } from 'node:crypto'

import {
  and,
  asc,
  count,
  countDistinct,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  isNull,
  lt,
  or,
  sql,
} from 'drizzle-orm'

import {
  decodeLegacyValue,
  encodeLegacyValue,
  hashPassword,
  issueToken,
  verifyToken,
} from '../auth'
import { getDatabase } from '../db'
import {
  clippings,
  comments,
  devices,
  externalAccounts,
  nfts,
  nouns,
  orders,
  reactions,
  userConnects,
  users,
  web3Addresses,
  webHookRecords,
  webHooks,
  type Clipping,
  type Comment,
  type Noun,
  type Reaction,
  type User,
} from '../db/schema'
import { getServerEnv } from '../env'
import { ApiError, assertFound } from '../errors'
import {
  fetchGithubIdentity,
  promptPalExecute,
  resolveEnsAvatar,
  sendOneTimePasscode,
  sendVerificationEmail,
  verifySmsCode,
  verifyTurnstile,
  verifyWeb3Signature,
  verifyAppleIdentityToken,
} from '../integrations'
import {
  cacheDelete,
  cacheGet,
  cacheSet,
  rateLimit,
  withRedisLock,
} from '../redis'
import { wechatLogin } from '../wechat'
import type { GraphQLContext } from './context'

type Args = Record<string, any>
type Book = {
  doubanId: string
  uid: number
  clippingsCount?: number
  startReadingAt?: Date
  lastReadingAt?: Date
  isLastReadingBook?: boolean
  pagination?: { limit: number; offset: number }
}

const db = () => getDatabase().db
const activeClipping = isNull(clippings.deletedAt)
const activeUser = isNull(users.deletedAt)
const activeComment = and(
  isNull(comments.deletedAt),
  eq(comments.enabled, true)
)

function requiredUser(context: GraphQLContext) {
  if (!context.userId) throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED')
  return context.userId
}

function page(args?: { limit?: number; lastId?: number | null }) {
  return {
    limit: Math.min(Math.max(args?.limit ?? 20, 1), 100),
    lastId: args?.lastId ?? 1 << 30,
  }
}

function legacyPage(args?: { limit?: number; offset?: number }) {
  return {
    limit: Math.min(Math.max(args?.limit ?? 20, 1), 100),
    offset: Math.max(args?.offset ?? 0, 0),
  }
}

function date(value?: Date | string | null) {
  if (!value) return ''
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString()
}

function sourceFromEnum(value?: string | null) {
  return value === 'weread' ? 2 : value === 'unknown' ? 0 : 1
}

function sourceToEnum(value: number) {
  return value === 2 ? 'weread' : value === 0 ? 'unknown' : 'kindle'
}

function targetFromEnum(value: string) {
  return value === 'book' ? 1 : value === 'user' ? 2 : 0
}

function targetToEnum(value: number) {
  return value === 1 ? 'book' : value === 2 ? 'user' : 'clipping'
}

function scopeFromEnum(value: string) {
  return value === 'book'
    ? 1
    : value === 'clipping'
      ? 2
      : value === 'forbid'
        ? 3
        : 0
}

function scopeToEnum(value: number) {
  return value === 1
    ? 'book'
    : value === 2
      ? 'clipping'
      : value === 3
        ? 'forbid'
        : 'all'
}

async function userById(id: number) {
  return assertFound(
    await db().query.users.findFirst({
      where: and(eq(users.id, id), activeUser),
    }),
    'user not found'
  )
}

async function clippingById(id: number, includeDeleted = false) {
  return assertFound(
    await db().query.clippings.findFirst({
      where: and(
        eq(clippings.id, id),
        includeDeleted ? undefined : activeClipping
      ),
    }),
    'clipping not found'
  )
}

function clippingVisibleTo(userId: number) {
  return userId
    ? or(eq(clippings.visible, true), eq(clippings.createdBy, userId))
    : eq(clippings.visible, true)
}

async function visibleClippingById(id: number, userId: number) {
  return assertFound(
    await db().query.clippings.findFirst({
      where: and(
        eq(clippings.id, id),
        activeClipping,
        clippingVisibleTo(userId)
      ),
    }),
    'clipping not found'
  )
}

async function authResponse(
  user: User,
  options?: { thirdParty?: boolean; isNew?: boolean }
) {
  return {
    user,
    token: await issueToken(user.id),
    noAccountFrom3rdPart: options?.thirdParty ?? false,
    isNewUser: options?.isNew ?? false,
  }
}

function normalizePhone(phone: string) {
  const plain = phone.replace(/^\+/, '')
  return /^1\d{10}$/.test(plain) ? `86${plain}` : plain
}

async function findOrCreatePhoneUser(phoneInput: string) {
  const phone = normalizePhone(phoneInput)
  const found = await db().query.users.findFirst({
    where: and(eq(users.phone, phone), activeUser),
  })
  if (found) return { user: found, isNew: false }
  const [created] = await db()
    .insert(users)
    .values({
      name: `user.${randomBytes(4).toString('hex')}`,
      email: `phone.${hashPassword(phone)}@annatarhe.com`,
      phone,
      pwd: 'phone_user',
      checked: true,
    })
    .returning()
  return { user: created, isNew: true }
}

async function validOtp(address: string, otp: string) {
  const value = await cacheGet<string>(`ck:otp:${address}`)
  if (!value) throw new ApiError('One Time Passcode not found')
  if (String(value) !== otp) {
    throw new ApiError(
      'One Time Passcode is invalid, please check your email box(maybe in spam box 😂)'
    )
  }
}

async function loadComments(filters: {
  clippingId?: number
  userId?: number
  pagination?: Args
}) {
  const conditions = [activeComment]
  if (filters.clippingId)
    conditions.push(eq(comments.belongsTo, filters.clippingId))
  if (filters.userId) conditions.push(eq(comments.createdBy, filters.userId))
  const pagination = page(filters.pagination)
  conditions.push(lt(comments.id, pagination.lastId))
  return db()
    .select()
    .from(comments)
    .where(and(...conditions))
    .orderBy(desc(comments.id))
    .limit(pagination.limit)
}

async function booksForUser(
  uid: number,
  pagination: { limit: number; offset: number },
  viewerId: number
) {
  const rows = await db()
    .select({
      doubanId: clippings.bookId,
      clippingsCount: count(clippings.id),
      startReadingAt: sql<Date>`min(${clippings.createdAt})`,
      lastReadingAt: sql<Date>`max(${clippings.createdAt})`,
    })
    .from(clippings)
    .where(
      and(
        eq(clippings.createdBy, uid),
        activeClipping,
        clippingVisibleTo(viewerId),
        sql`${clippings.bookId} <> ''`,
        sql`${clippings.bookId} <> '0'`
      )
    )
    .groupBy(clippings.bookId)
    .orderBy(sql`max(${clippings.createdAt}) desc`)
    .limit(pagination.limit)
    .offset(pagination.offset)
  return rows.map((row, index) => ({
    ...row,
    uid,
    isLastReadingBook: pagination.offset + index === 0,
  }))
}

async function createOrUpdateExternal(
  userId: number,
  values: Partial<typeof externalAccounts.$inferInsert>
) {
  const found = await db().query.externalAccounts.findFirst({
    where: eq(externalAccounts.userId, userId),
  })
  if (found) {
    await db()
      .update(externalAccounts)
      .set(values)
      .where(eq(externalAccounts.id, found.id))
    return
  }
  await db()
    .insert(externalAccounts)
    .values({ userId, ...values })
}

async function webhookForClippings(userId: number, created: Clipping[]) {
  if (!created.length) return
  const hook = await db().query.webHooks.findFirst({
    where: and(eq(webHooks.owner, userId), eq(webHooks.step, 0)),
  })
  if (!hook) return
  const start = new Date()
  let status = 0
  let responseBody = ''
  let responseHeaders = '{}'
  let errorMessage = ''
  try {
    const response = await fetch(hook.hookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(created),
      signal: AbortSignal.timeout(15_000),
    })
    status = response.status
    responseBody = (await response.text()).slice(0, 64_000)
    responseHeaders = JSON.stringify(Object.fromEntries(response.headers))
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : String(error)
  }
  await db()
    .insert(webHookRecords)
    .values({
      requestMethod: 'POST',
      requestUrl: hook.hookUrl,
      requestHeaders: { 'Content-Type': 'application/json' },
      requestBody: JSON.stringify(created),
      responseStatus: status,
      responseHeaders,
      responseBody,
      startTime: start,
      endTime: new Date(),
      errorMessage,
      webHookRecords: hook.id,
    })
}

function htmlEscape(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export const resolvers: Record<string, Record<string, any>> = {
  Query: {
    auth: async (_: unknown, args: Args, context: GraphQLContext) => {
      await verifyTurnstile(args.cfTurnstileToken, context.ip)
      const user = await db().query.users.findFirst({
        where: and(
          eq(users.email, String(args.email).toLowerCase()),
          eq(users.pwd, hashPassword(args.pwd)),
          activeUser
        ),
      })
      if (!user) throw new ApiError('email or password is incorrect')
      if (!user.checked)
        throw new ApiError('please check email to finish signup', 403)
      const { pendingAccountRemovalKey } = await import('../jobs/queues')
      await cacheDelete(pendingAccountRemovalKey(user.id))
      return authResponse(user)
    },
    mpAuth: async (_: unknown, args: Args) => {
      const identity = await wechatLogin(args.code)
      const account = await db().query.externalAccounts.findFirst({
        where: eq(externalAccounts.wechatOpenId, identity.openid!),
      })
      if (account?.userId)
        return authResponse(await userById(account.userId), {
          thirdParty: true,
        })
      return db().transaction(async (transaction) => {
        const [user] = await transaction
          .insert(users)
          .values({
            name: 'NULL',
            email: `wechat.mp.${identity.openid}@clippingkk.annatarhe.com`,
            pwd: 'not_allow_to_login',
            checked: true,
          })
          .returning()
        await transaction.insert(externalAccounts).values({
          userId: user.id,
          wechatOpenId: identity.openid,
          wechatUnionId: identity.unionid ?? '',
        })
        return authResponse(user, { thirdParty: true, isNew: true })
      })
    },
    loginByApple: async (_: unknown, args: Args) => {
      const claims = await verifyAppleIdentityToken(
        args.payload.idToken,
        args.payload.platform
      )
      const account = await db().query.externalAccounts.findFirst({
        where: eq(externalAccounts.appleUnique, claims.unique),
      })
      if (!account) throw new ApiError('Apple account is not bound', 404)
      return authResponse(await userById(account.userId), { thirdParty: true })
    },
    loginByWeb3: async (_: unknown, args: Args) => {
      const address = String(args.payload.address).toLowerCase()
      if (
        !(await verifyWeb3Signature(
          address,
          args.payload.text,
          args.payload.signature
        ))
      ) {
        throw new ApiError('signature invalid')
      }
      const entry = await db().query.web3Addresses.findFirst({
        where: eq(web3Addresses.address, address),
      })
      if (!entry?.userAddress)
        throw new ApiError('Web3 account is not bound', 404)
      return authResponse(await userById(entry.userAddress), {
        thirdParty: true,
      })
    },
    githubAuth: async (_: unknown, args: Args) => {
      const identity = await fetchGithubIdentity(args.code)
      let user = await db().query.users.findFirst({
        where: and(eq(users.email, identity.email), activeUser),
      })
      let isNew = false
      if (!user) {
        ;[user] = await db()
          .insert(users)
          .values({
            name: identity.name || identity.login,
            email: identity.email,
            pwd: hashPassword(randomBytes(32).toString('hex')),
            avatar: identity.avatar_url,
            checked: true,
          })
          .returning()
        isNew = true
      }
      await createOrUpdateExternal(user.id, {
        githubAccessToken: identity.accessToken,
      })
      return authResponse(user, { thirdParty: true, isNew })
    },
    books: (_: unknown, args: Args, context: GraphQLContext) =>
      booksForUser(
        args.uid ?? requiredUser(context),
        legacyPage(args.pagination),
        context.userId
      ),
    book: async (_: unknown, args: Args, context: GraphQLContext) => {
      const uid = args.uid ?? requiredUser(context)
      const doubanId = String(args.id)
      const [row] = await db()
        .select({
          clippingsCount: count(clippings.id),
          startReadingAt: sql<Date>`min(${clippings.createdAt})`,
          lastReadingAt: sql<Date>`max(${clippings.createdAt})`,
        })
        .from(clippings)
        .where(
          and(
            eq(clippings.createdBy, uid),
            eq(clippings.bookId, doubanId),
            activeClipping,
            clippingVisibleTo(context.userId)
          )
        )
      if (!row?.clippingsCount) throw new ApiError('book not found', 404)
      return { doubanId, uid, ...row, pagination: legacyPage(args.pagination) }
    },
    public: async (_: unknown, args: Args) => {
      const limit = Math.min(args.limit ?? 12, 50)
      const [publicUsers, publicClippings] = await Promise.all([
        db()
          .select()
          .from(users)
          .where(activeUser)
          .orderBy(desc(users.id))
          .limit(limit),
        db()
          .select()
          .from(clippings)
          .where(and(activeClipping, eq(clippings.visible, true)))
          .orderBy(desc(clippings.id))
          .limit(limit),
      ])
      const bookRows = await db()
        .select({
          doubanId: clippings.bookId,
          uid: clippings.createdBy,
          clippingsCount: count(clippings.id),
        })
        .from(clippings)
        .where(
          and(
            activeClipping,
            eq(clippings.visible, true),
            sql`${clippings.bookId} <> ''`
          )
        )
        .groupBy(clippings.bookId, clippings.createdBy)
        .orderBy(desc(count(clippings.id)))
        .limit(limit)
      return { users: publicUsers, books: bookRows, clippings: publicClippings }
    },
    me: async (_: unknown, args: Args, context: GraphQLContext) => {
      if (args.id) return userById(args.id)
      if (args.domain) {
        return assertFound(
          await db().query.users.findFirst({
            where: and(eq(users.domain, String(args.domain)), activeUser),
          }),
          'user not found'
        )
      }
      return userById(requiredUser(context))
    },
    clipping: (_: unknown, args: Args, context: GraphQLContext) =>
      visibleClippingById(args.id, context.userId),
    clippings: (_: unknown, args: Args, context: GraphQLContext) =>
      args.ids.length
        ? db()
            .select()
            .from(clippings)
            .where(
              and(
                inArray(clippings.id, args.ids),
                activeClipping,
                clippingVisibleTo(context.userId)
              )
            )
            .limit(100)
        : [],
    clippingList: async (_: unknown, args: Args) => {
      const pagination = page(args.pagination)
      const where = and(
        eq(clippings.createdBy, args.uid),
        eq(clippings.visible, true),
        activeClipping
      )
      const [[total], items] = await Promise.all([
        db().select({ value: count() }).from(clippings).where(where),
        db()
          .select()
          .from(clippings)
          .where(and(where, lt(clippings.id, pagination.lastId)))
          .orderBy(desc(clippings.id))
          .limit(pagination.limit),
      ])
      return { count: total.value, items }
    },
    featuredClippings: (_: unknown, args: Args) => {
      const pagination = page(args.pagination)
      return db()
        .select()
        .from(clippings)
        .where(
          and(
            activeClipping,
            eq(clippings.visible, true),
            lt(clippings.id, pagination.lastId)
          )
        )
        .orderBy(desc(clippings.id))
        .limit(pagination.limit)
    },
    wechatBindKey: async (_: unknown, _args: Args, context: GraphQLContext) => {
      const uid = requiredUser(context)
      await userById(uid)
      return encodeLegacyValue(String(uid))
    },
    adminDashboard: async (_: unknown, args: Args, context: GraphQLContext) => {
      const uid = requiredUser(context)
      if (!getServerEnv().rootUsers.has(uid))
        throw new ApiError('Forbidden', 403, 'FORBIDDEN')
      const pagination = legacyPage(args.pagination)
      const rows = await db()
        .selectDistinct({ title: clippings.title })
        .from(clippings)
        .where(and(activeClipping, eq(clippings.bookId, '0')))
        .limit(pagination.limit)
        .offset(pagination.offset)
      return { uncheckedBooks: rows }
    },
    reportYearly: async (_: unknown, args: Args) => {
      const user = args.domain
        ? assertFound(
            await db().query.users.findFirst({
              where: and(eq(users.domain, args.domain), activeUser),
            })
          )
        : await userById(args.uid)
      const from = new Date(Date.UTC(args.year, 0, 1))
      const until = new Date(Date.UTC(args.year + 1, 0, 1))
      const rows = await db()
        .select({
          doubanId: clippings.bookId,
          clippingsCount: count(clippings.id),
          startReadingAt: sql<Date>`min(${clippings.createdAt})`,
          lastReadingAt: sql<Date>`max(${clippings.createdAt})`,
        })
        .from(clippings)
        .where(
          and(
            eq(clippings.createdBy, user.id),
            activeClipping,
            gte(clippings.createdAt, from),
            lt(clippings.createdAt, until)
          )
        )
        .groupBy(clippings.bookId)
      return { user, books: rows.map((row) => ({ ...row, uid: user.id })) }
    },
    search: async (_: unknown, args: Args, context: GraphQLContext) => {
      const scopeUser = args.scope === 'Me' ? requiredUser(context) : 0
      const q = `%${args.query}%`
      const foundUsers =
        args.type === 'BookName'
          ? []
          : await db()
              .select()
              .from(users)
              .where(
                and(
                  activeUser,
                  or(ilike(users.name, q), ilike(users.domain, q))
                )
              )
              .limit(10)
      const foundClippings =
        args.type === 'User'
          ? []
          : await db()
              .select()
              .from(clippings)
              .where(
                and(
                  activeClipping,
                  scopeUser
                    ? eq(clippings.createdBy, scopeUser)
                    : eq(clippings.visible, true),
                  or(ilike(clippings.title, q), ilike(clippings.content, q))
                )
              )
              .limit(10)
      return { users: foundUsers, clippings: foundClippings }
    },
    domainAvailable: async (_: unknown, args: Args) => {
      const found = await db().query.users.findFirst({
        where: eq(users.domain, String(args.q).toLowerCase()),
      })
      return !found
    },
    noun: async (_: unknown, args: Args) =>
      assertFound(
        await db().query.nouns.findFirst({ where: eq(nouns.id, args.id) }),
        'noun not found'
      ),
    webHook: async (_: unknown, args: Args, context: GraphQLContext) => {
      const hook = assertFound(
        await db().query.webHooks.findFirst({
          where: eq(webHooks.id, args.id),
        }),
        'webhook not found'
      )
      if (hook.owner !== requiredUser(context))
        throw new ApiError('Forbidden', 403)
      return hook
    },
    getComment: async (_: unknown, args: Args) =>
      assertFound(
        await db().query.comments.findFirst({ where: eq(comments.id, args.id) })
      ),
    getCommentList: async (_: unknown, args: Args) => {
      const conditions = [activeComment]
      if (args.cid) conditions.push(eq(comments.belongsTo, args.cid))
      if (args.uid) conditions.push(eq(comments.createdBy, args.uid))
      const [total] = await db()
        .select({ value: count() })
        .from(comments)
        .where(and(...conditions))
      return {
        count: total.value,
        items: await loadComments({
          clippingId: args.cid,
          userId: args.uid,
          pagination: args.pagination,
        }),
      }
    },
  },
  Mutation: {
    signup: async (_: unknown, args: Args) => {
      const email = String(args.payload.email).toLowerCase()
      await validOtp(email, args.payload.otp)
      if (await db().query.users.findFirst({ where: eq(users.email, email) })) {
        throw new ApiError('email already exists')
      }
      const [user] = await db()
        .insert(users)
        .values({
          name: `user-${Math.floor(Date.now() / 1000)}`,
          email,
          pwd: hashPassword(args.payload.password),
          checked: true,
        })
        .returning()
      const code = crypto.randomUUID()
      await cacheSet(`auth:signup:mail:${code}`, user.id, 3 * 24 * 60 * 60)
      void sendVerificationEmail(email, code).catch(console.error)
      const { enqueueDestroyUser } = await import('../jobs/queues')
      await enqueueDestroyUser(user.id)
      return authResponse(user, { isNew: true })
    },
    loginV3: async (_: unknown, args: Args) => {
      const email = String(args.payload.email).toLowerCase()
      await validOtp(email, args.payload.otp)
      let user = await db().query.users.findFirst({
        where: and(eq(users.email, email), activeUser),
      })
      let isNew = false
      if (!user) {
        ;[user] = await db()
          .insert(users)
          .values({
            name: `user-${Math.floor(Date.now() / 1000)}`,
            email,
            pwd: hashPassword(randomBytes(32).toString('hex')),
            checked: true,
          })
          .returning()
        isNew = true
      }
      return authResponse(user, { isNew })
    },
    bindAppleUnique: async (
      _: unknown,
      args: Args,
      context: GraphQLContext
    ) => {
      const claims = await verifyAppleIdentityToken(
        args.payload.idToken,
        args.payload.platform
      )
      const boundAccount = await db().query.externalAccounts.findFirst({
        where: eq(externalAccounts.appleUnique, claims.unique),
      })
      if (boundAccount && boundAccount.userId !== context.userId) {
        throw new ApiError('Apple account is already bound', 409)
      }
      let user: User
      let isNew = false
      if (context.userId) user = await userById(context.userId)
      else if (args.phone && args.code) {
        await verifySmsCode(args.phone, args.code)
        ;({ user, isNew } = await findOrCreatePhoneUser(args.phone))
      } else if (claims.email) {
        const email = claims.email.toLowerCase()
        const existing = await db().query.users.findFirst({
          where: and(eq(users.email, email), activeUser),
        })
        if (existing) user = existing
        else {
          ;[user] = await db()
            .insert(users)
            .values({
              name: email.split('@')[0],
              email,
              pwd: hashPassword(randomBytes(32).toString('hex')),
              checked: true,
            })
            .returning()
          isNew = true
        }
      } else throw new ApiError('phone or Apple email is required')
      await createOrUpdateExternal(user.id, { appleUnique: claims.unique })
      const { AUDITING_EMAIL, enqueueCancelAppleBind } =
        await import('../jobs/queues')
      if (user.email === AUDITING_EMAIL)
        await enqueueCancelAppleBind(claims.unique)
      return authResponse(user, { thirdParty: true, isNew })
    },
    bindWeb3Address: async (
      _: unknown,
      args: Args,
      context: GraphQLContext
    ) => {
      const address = String(args.payload.address).toLowerCase()
      if (
        !(await verifyWeb3Signature(
          address,
          args.payload.text,
          args.payload.signature
        ))
      ) {
        throw new ApiError('signature invalid')
      }
      if (
        await db().query.web3Addresses.findFirst({
          where: eq(web3Addresses.address, address),
        })
      ) {
        throw new ApiError('address already been taken')
      }
      let user: User
      let isNew = false
      if (context.userId) user = await userById(context.userId)
      else if (args.phone && args.code) {
        await verifySmsCode(args.phone, args.code)
        ;({ user, isNew } = await findOrCreatePhoneUser(args.phone))
      } else {
        const avatar = await resolveEnsAvatar(address)
        ;[user] = await db()
          .insert(users)
          .values({
            name: address,
            email: `web3.${address}@annatarhe.com`,
            pwd: 'web3_user',
            avatar,
            checked: true,
          })
          .returning()
        await createOrUpdateExternal(user.id, {})
        isNew = true
      }
      await db().insert(web3Addresses).values({ address, userAddress: user.id })
      return authResponse(user, { thirdParty: true, isNew })
    },
    authByPhone: async (_: unknown, args: Args) => {
      await verifySmsCode(args.phone, args.code)
      const { user, isNew } = await findOrCreatePhoneUser(args.phone)
      return authResponse(user, { isNew })
    },
    createClippings: async (
      _: unknown,
      args: Args,
      context: GraphQLContext
    ) => {
      const userId = requiredUser(context)
      const visible = args.visible ?? true
      const globalNouns = await db()
        .select({ id: nouns.id, noun: nouns.noun })
        .from(nouns)
        .where(eq(nouns.scope, 0))
      const updatedAt = new Date()
      const values = args.payload.map((item: Args) => {
        const createdAt = new Date(item.createdAt)
        return {
          title: String(item.title).replace(/^[，,\s]+|[，,\s]+$/g, ''),
          content: String(item.content).replace(/^[，,\s]+|[，,\s]+$/g, ''),
          bookId: String(item.bookID),
          pageAt: String(item.pageAt),
          dataId: hashPassword(`${item.content}${item.pageAt}${userId}`),
          seq: -1,
          createdBy: userId,
          visible,
          nouns: globalNouns
            .filter((noun) => item.content.includes(noun.noun))
            .map((noun) => noun.id),
          source: sourceFromEnum(item.source),
          createdAt: Number.isNaN(createdAt.getTime()) ? new Date() : createdAt,
          updatedAt,
        }
      })
      const created = values.length
        ? await db()
            .insert(clippings)
            .values(values)
            .onConflictDoNothing()
            .returning()
        : []
      void webhookForClippings(userId, created).catch(console.error)
      await cacheDelete(`ck:books:${userId}`)
      return created
    },
    editClipping: async (_: unknown, args: Args, context: GraphQLContext) => {
      const clipping = await clippingById(args.id)
      if (clipping.createdBy !== requiredUser(context))
        throw new ApiError('Forbidden', 403)
      const [updated] = await db()
        .update(clippings)
        .set({ content: args.content, updatedAt: new Date() })
        .where(eq(clippings.id, args.id))
        .returning()
      return updated
    },
    deleteClipping: async (_: unknown, args: Args, context: GraphQLContext) => {
      const clipping = await clippingById(args.id)
      if (clipping.createdBy !== requiredUser(context))
        throw new ApiError('Forbidden', 403)
      const [deleted] = await db()
        .update(clippings)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(clippings.id, args.id))
        .returning()
      return deleted
    },
    onCreateClippingEnd: async () => true,
    syncHomelessBook: async (
      _: unknown,
      args: Args,
      context: GraphQLContext
    ) => {
      const uid = requiredUser(context)
      await db()
        .update(clippings)
        .set({ bookId: args.doubanID, updatedAt: new Date() })
        .where(
          and(
            eq(clippings.createdBy, uid),
            eq(clippings.title, args.title),
            activeClipping
          )
        )
      return true
    },
    wechatBindByKey: async (
      _: unknown,
      args: Args,
      context: GraphQLContext
    ) => {
      const currentUserId = requiredUser(context)
      return withRedisLock(
        `lock:wechat:bind:${currentUserId}`,
        60_000,
        async () => {
          const targetUserId = Number(await decodeLegacyValue(args.key))
          if (!targetUserId) throw new ApiError('invalid bind key')
          const target = await userById(targetUserId)
          const current = await userById(currentUserId)
          if (!current.email.startsWith('wechat.mp.'))
            return authResponse(current)
          const account = assertFound(
            await db().query.externalAccounts.findFirst({
              where: eq(externalAccounts.userId, currentUserId),
            }),
            'WeChat account not found'
          )
          await db().transaction(async (transaction) => {
            const targetAccount =
              await transaction.query.externalAccounts.findFirst({
                where: eq(externalAccounts.userId, targetUserId),
              })
            if (targetAccount) {
              await transaction
                .update(externalAccounts)
                .set({
                  wechatOpenId: account.wechatOpenId,
                  wechatUnionId: account.wechatUnionId,
                })
                .where(eq(externalAccounts.id, targetAccount.id))
              await transaction
                .delete(externalAccounts)
                .where(eq(externalAccounts.id, account.id))
            } else {
              await transaction
                .update(externalAccounts)
                .set({ userId: targetUserId })
                .where(eq(externalAccounts.id, account.id))
            }
            await transaction
              .update(users)
              .set({ deletedAt: new Date(), updatedAt: new Date() })
              .where(eq(users.id, currentUserId))
          })
          const { AUDITING_EMAIL, enqueueCancelWechatBind } =
            await import('../jobs/queues')
          if (target.email === AUDITING_EMAIL)
            await enqueueCancelWechatBind(target.email)
          return authResponse(target, { thirdParty: true })
        }
      )
    },
    updateClippingBookId: async (
      _: unknown,
      args: Args,
      context: GraphQLContext
    ) => {
      const uid = requiredUser(context)
      const clipping = await clippingById(args.clippingId)
      if (clipping.createdBy !== uid)
        throw new ApiError('not your clipping', 403)
      const [updated] = await db()
        .update(clippings)
        .set({ bookId: String(args.doubanId), updatedAt: new Date() })
        .where(
          and(
            eq(clippings.id, clipping.id),
            eq(clippings.createdBy, uid),
            activeClipping
          )
        )
        .returning()
      return assertFound(updated, 'clipping not found')
    },
    createComment: async (_: unknown, args: Args, context: GraphQLContext) => {
      await clippingById(args.cid)
      const [created] = await db()
        .insert(comments)
        .values({
          belongsTo: args.cid,
          createdBy: requiredUser(context),
          content: args.content,
        })
        .returning()
      return created
    },
    deleteComment: async (_: unknown, args: Args, context: GraphQLContext) => {
      const comment = assertFound(
        await db().query.comments.findFirst({
          where: eq(comments.id, args.id),
        }),
        'comment not found'
      )
      if (comment.createdBy !== requiredUser(context))
        throw new ApiError('Forbidden', 403)
      await db()
        .update(comments)
        .set({ enabled: false, deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(comments.id, args.id))
      return true
    },
    toggleClippingVisible: async (
      _: unknown,
      args: Args,
      context: GraphQLContext
    ) => {
      const uid = requiredUser(context)
      const owned = await db()
        .select()
        .from(clippings)
        .where(
          and(
            inArray(clippings.id, args.ids),
            eq(clippings.createdBy, uid),
            activeClipping
          )
        )
      if (owned.length !== args.ids.length)
        throw new ApiError('403, not the owner', 403)
      return Promise.all(
        owned.map(async (item) => {
          const [updated] = await db()
            .update(clippings)
            .set({ visible: !item.visible, updatedAt: new Date() })
            .where(eq(clippings.id, item.id))
            .returning()
          return updated
        })
      )
    },
    updateUserProfile: async (
      _: unknown,
      args: Args,
      context: GraphQLContext
    ) => {
      const id = requiredUser(context)
      const changes: Partial<typeof users.$inferInsert> = {
        updatedAt: new Date(),
      }
      for (const key of ['name', 'avatar', 'bio'] as const) {
        if (args[key] !== undefined && args[key] !== null)
          changes[key] = args[key]
      }
      if (args.domain !== undefined && args.domain !== null) {
        const domain = String(args.domain).trim().toLowerCase()
        if (!/^[a-z0-9][a-z0-9-]{2,31}$/.test(domain))
          throw new ApiError('domain invalid')
        const exists = await db().query.users.findFirst({
          where: and(eq(users.domain, domain), sql`${users.id} <> ${id}`),
        })
        if (exists) throw new ApiError('domain already taken')
        changes.domain = domain
      }
      const [updated] = await db()
        .update(users)
        .set(changes)
        .where(eq(users.id, id))
        .returning()
      return updated
    },
    follow: async (_: unknown, args: Args, context: GraphQLContext) => {
      const owner = requiredUser(context)
      if (owner === args.targetUserID) return true
      await userById(args.targetUserID)
      await db()
        .insert(userConnects)
        .values({ owner, target: args.targetUserID, connectType: 0 })
        .onConflictDoNothing()
      return true
    },
    unfollow: async (_: unknown, args: Args, context: GraphQLContext) => {
      await db()
        .delete(userConnects)
        .where(
          and(
            eq(userConnects.owner, requiredUser(context)),
            eq(userConnects.target, args.targetUserID),
            eq(userConnects.connectType, 0)
          )
        )
      return true
    },
    createReaction: async (_: unknown, args: Args, context: GraphQLContext) => {
      const creator = requiredUser(context)
      const target = targetFromEnum(args.target)
      const existing = await db().query.reactions.findFirst({
        where: and(
          eq(reactions.creator, creator),
          eq(reactions.target, target),
          eq(reactions.targetId, args.targetId),
          eq(reactions.symbol, args.symbol),
          isNull(reactions.deletedAt)
        ),
      })
      if (!existing) {
        await db().insert(reactions).values({
          creator,
          target,
          targetId: args.targetId,
          symbol: args.symbol,
        })
      }
      return true
    },
    removeReaction: async (_: unknown, args: Args, context: GraphQLContext) => {
      if (args.rid <= 0) throw new ApiError('reaction id required')
      const conditions = [
        eq(reactions.creator, requiredUser(context)),
        eq(reactions.id, args.rid),
        isNull(reactions.deletedAt),
      ]
      if (args.symbol) conditions.push(eq(reactions.symbol, args.symbol))
      await db()
        .update(reactions)
        .set({ deletedAt: new Date() })
        .where(and(...conditions))
      return true
    },
    exportData: async (_: unknown, args: Args, context: GraphQLContext) => {
      const uid = requiredUser(context)
      const key = `admin:export:id:${uid}`
      if (await cacheGet(key))
        throw new ApiError(
          'only avaliable for one download every 3 minutes',
          429
        )
      await cacheSet(key, true, 180)
      const { enqueueExport } = await import('../jobs/queues')
      await enqueueExport({
        destination: args.destination,
        args: args.args,
        uid,
      })
      return true
    },
    sendResetTempCode: async (_: unknown, args: Args) => {
      const email = String(args.email).toLowerCase()
      await userById(
        assertFound(
          await db().query.users.findFirst({
            where: and(eq(users.email, email), activeUser),
          })
        ).id
      )
      const code = String(randomInt(100000, 1000000))
      await cacheSet(`ck:otp:${email}`, code, 600)
      await sendOneTimePasscode(email, code)
      return true
    },
    resetPassword: async (_: unknown, args: Args) => {
      const email = String(args.email).toLowerCase()
      await validOtp(email, args.code)
      const [user] = await db()
        .update(users)
        .set({ pwd: hashPassword(args.password), updatedAt: new Date() })
        .where(and(eq(users.email, email), activeUser))
        .returning()
      return authResponse(assertFound(user, 'user not found'))
    },
    bindPhone: async (_: unknown, args: Args, context: GraphQLContext) => {
      await verifySmsCode(args.phone, args.code)
      const phone = normalizePhone(args.phone)
      const owner = await db().query.users.findFirst({
        where: and(eq(users.phone, phone), activeUser),
      })
      if (owner && owner.id !== context.userId)
        throw new ApiError('phone already taken')
      const [user] = await db()
        .update(users)
        .set({ phone, updatedAt: new Date() })
        .where(eq(users.id, requiredUser(context)))
        .returning()
      return user
    },
    createWebHook: async (_: unknown, args: Args, context: GraphQLContext) => {
      const owner = requiredUser(context)
      let parsed: URL
      try {
        parsed = new URL(args.hookUrl)
      } catch {
        throw new ApiError('invalid hook URL')
      }
      if (!['http:', 'https:'].includes(parsed.protocol))
        throw new ApiError('invalid hook URL')
      const [hook] = await db()
        .insert(webHooks)
        .values({ owner, step: 0, hookUrl: parsed.toString() })
        .onConflictDoUpdate({
          target: [webHooks.owner, webHooks.step],
          set: { hookUrl: parsed.toString() },
        })
        .returning()
      return hook
    },
    deleteWebHook: async (_: unknown, args: Args, context: GraphQLContext) => {
      await db()
        .delete(webHooks)
        .where(
          and(
            eq(webHooks.id, args.id),
            eq(webHooks.owner, requiredUser(context))
          )
        )
      return true
    },
    claimAPIKey: async (_: unknown, args: Args, context: GraphQLContext) => {
      const uid = requiredUser(context)
      if ((await verifyToken(args.token)) !== uid)
        throw new ApiError('Not your token', 403)
      return encodeLegacyValue(args.token)
    },
    removeMyAccount: async (
      _: unknown,
      _args: Args,
      context: GraphQLContext
    ) => {
      const uid = requiredUser(context)
      const { enqueueRemoveAccount, pendingAccountRemovalKey } =
        await import('../jobs/queues')
      const job = await enqueueRemoveAccount(uid)
      if (!job.id) throw new ApiError('account deletion could not be scheduled')
      await cacheSet(pendingAccountRemovalKey(uid), job.id, 24 * 60 * 60)
      return true
    },
    sendOneTimePasscode: async (
      _: unknown,
      args: Args,
      context: GraphQLContext
    ) => {
      await verifyTurnstile(args.cfTurnstileToken, context.ip)
      const limit = await rateLimit(
        `otp:limit:${context.ip || args.address}`,
        1,
        60
      )
      if (!limit.allowed) throw new ApiError('too many requests', 429)
      const code = String(randomInt(100000, 1000000))
      await cacheSet(`ck:otp:${args.address}`, code, 600)
      await sendOneTimePasscode(args.address, code)
      return true
    },
    bindDeviceToken: async (
      _: unknown,
      args: Args,
      context: GraphQLContext
    ) => {
      const userId = requiredUser(context)
      const existing = await db().query.devices.findFirst({
        where: and(
          eq(devices.deviceId, args.deviceId),
          eq(devices.userId, userId)
        ),
      })
      const values = {
        deviceName: args.deviceName,
        appVersion: args.appVersion,
        iosDeviceToken: args.iosDeviceToken,
        os: args.os,
        osVersion: args.osVersion,
        updatedAt: new Date(),
      }
      if (existing)
        await db()
          .update(devices)
          .set(values)
          .where(eq(devices.id, existing.id))
      else
        await db()
          .insert(devices)
          .values({ ...values, deviceId: args.deviceId, userId })
      return userById(userId)
    },
    aiEnhanceComment: async (
      _: unknown,
      args: Args,
      context: GraphQLContext
    ) => {
      requiredUser(context)
      const prompts: Record<number, string> = {
        1: 'w4XVBg0NoYGb',
        2: 'dgJe7a8WGVZj',
        3: 'XMkwB53W58vz',
        4: 'nKGPBDmNw4Xl',
      }
      const prompt = prompts[args.promptId]
      if (!prompt) throw new ApiError('prompt not found')
      const clipping = args.clippingId
        ? await clippingById(args.clippingId)
        : undefined
      const content = await promptPalExecute(prompt, {
        bookName: args.bookName ?? clipping?.title ?? '',
        clipping: clipping?.content ?? '',
        content: args.content,
      })
      return { content }
    },
    createNoun: async (_: unknown, args: Args, context: GraphQLContext) => {
      const creator = requiredUser(context)
      const scope = scopeFromEnum(args.payload.scope)
      const [created] = await db()
        .insert(nouns)
        .values({
          noun: args.payload.noun,
          bookId: args.payload.bookId ?? '',
          clippingId: args.payload.clippingId ?? -1,
          content: args.payload.content,
          scope,
          updaters: [creator],
          userNouns: creator,
        })
        .returning()
      return created
    },
    updateNoun: async (_: unknown, args: Args, context: GraphQLContext) => {
      const uid = requiredUser(context)
      const noun = assertFound(
        await db().query.nouns.findFirst({ where: eq(nouns.id, args.id) })
      )
      if (noun.userNouns !== uid && !noun.updaters.includes(uid))
        throw new ApiError('Forbidden', 403)
      const [updated] = await db()
        .update(nouns)
        .set({
          content: args.payload.content,
          scope: scopeFromEnum(args.payload.scope),
          updaters: [...new Set([...noun.updaters, uid])],
          updatedAt: new Date(),
        })
        .where(eq(nouns.id, noun.id))
        .returning()
      return updated
    },
    deleteNoun: async (_: unknown, args: Args, context: GraphQLContext) => {
      const uid = requiredUser(context)
      const noun = assertFound(
        await db().query.nouns.findFirst({ where: eq(nouns.id, args.id) })
      )
      if (noun.userNouns !== uid) throw new ApiError('Forbidden', 403)
      await db().delete(nouns).where(eq(nouns.id, noun.id))
      const { enqueueNounCleanup } = await import('../jobs/queues')
      await enqueueNounCleanup(noun.id)
      return true
    },
  },
  AuthResponse: {
    noAccountFrom3rdPart: (parent: Args) =>
      parent.noAccountFrom3rdPart ?? false,
    isNewUser: (parent: Args) => parent.isNewUser ?? false,
  },
  User: {
    password: (user: User, _args: Args, context: GraphQLContext) =>
      context.userId === user.id ? user.pwd : '',
    phone: (user: User, _args: Args, context: GraphQLContext) =>
      context.userId === user.id ? user.phone : '',
    email: (user: User, _args: Args, context: GraphQLContext) =>
      context.userId === user.id ? user.email : '',
    createdAt: (user: User) => date(user.createdAt),
    updatedAt: (user: User) => date(user.updatedAt),
    premiumEndAt: (user: User) => date(user.premiumEndAt),
    wechatOpenid: async (user: User, _args: Args, context: GraphQLContext) => {
      if (context.userId !== user.id) return ''
      return (
        (
          await db().query.externalAccounts.findFirst({
            where: eq(externalAccounts.userId, user.id),
          })
        )?.wechatOpenId ?? ''
      )
    },
    appleUnique: async (user: User, _args: Args, context: GraphQLContext) => {
      if (context.userId !== user.id) return ''
      return (
        (
          await db().query.externalAccounts.findFirst({
            where: eq(externalAccounts.userId, user.id),
          })
        )?.appleUnique ?? ''
      )
    },
    devices: (user: User, _args: Args, context: GraphQLContext) =>
      context.userId === user.id
        ? db()
            .select()
            .from(devices)
            .where(eq(devices.userId, user.id))
            .orderBy(desc(devices.id))
        : [],
    orderList: async (user: User, _args: Args, context: GraphQLContext) => {
      if (context.userId !== user.id) return []
      const rows = await db()
        .select({
          id: orders.id,
          orderId: orders.orderId,
          sku: orders.sku,
          subscriptionId: orders.subscriptionId,
          orderCreatedAt: orders.orderCreatedAt,
          amount: orders.amount,
          currency: orders.currency,
        })
        .from(orders)
        .where(eq(orders.userOrders, user.id))
        .orderBy(desc(orders.id))
      const grouped = Map.groupBy(
        rows,
        (row) => row.subscriptionId || row.orderId
      )
      return [...grouped.entries()].map(([id, items]) => ({
        id,
        subscriptionId: items[0].subscriptionId,
        status: 'active',
        orders: items,
      }))
    },
    recents: (user: User, _args: Args, context: GraphQLContext) =>
      db()
        .select()
        .from(clippings)
        .where(
          and(
            eq(clippings.createdBy, user.id),
            activeClipping,
            clippingVisibleTo(context.userId)
          )
        )
        .orderBy(desc(clippings.createdAt))
        .limit(20),
    comments: (user: User) => loadComments({ userId: user.id }),
    commentList: async (user: User, args: Args) => {
      const conditions = and(activeComment, eq(comments.createdBy, user.id))
      const [total] = await db()
        .select({ value: count() })
        .from(comments)
        .where(conditions)
      return {
        count: total.value,
        items: await loadComments({
          userId: user.id,
          pagination: args.pagination,
        }),
      }
    },
    clippingsCount: async (user: User) => {
      const [row] = await db()
        .select({ value: count() })
        .from(clippings)
        .where(and(eq(clippings.createdBy, user.id), activeClipping))
      return row.value
    },
    booksCount: async (user: User) => {
      const [row] = await db()
        .select({ value: countDistinct(clippings.bookId) })
        .from(clippings)
        .where(
          and(
            eq(clippings.createdBy, user.id),
            activeClipping,
            sql`${clippings.bookId} <> ''`,
            sql`${clippings.bookId} <> '0'`
          )
        )
      return row.value
    },
    recent3mReadings: async (user: User) => {
      const rows = await db()
        .selectDistinct({ bookId: clippings.bookId })
        .from(clippings)
        .where(
          and(
            eq(clippings.createdBy, user.id),
            activeClipping,
            gte(
              clippings.createdAt,
              new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
            )
          )
        )
      return rows.map((row) => row.bookId)
    },
    analysis: async (user: User, _args: Args, context: GraphQLContext) => {
      const daily = await db()
        .select({
          date: sql<string>`to_char(${clippings.createdAt}, 'YYYY-MM-DD')`,
          count: count(),
        })
        .from(clippings)
        .where(
          and(
            eq(clippings.createdBy, user.id),
            activeClipping,
            gte(
              clippings.createdAt,
              new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
            )
          )
        )
        .groupBy(sql`to_char(${clippings.createdAt}, 'YYYY-MM-DD')`)
        .orderBy(asc(sql`to_char(${clippings.createdAt}, 'YYYY-MM-DD')`))
      const monthly = await db()
        .select({
          date: sql<string>`to_char(${clippings.createdAt}, 'YYYY-MM')`,
          count: count(),
        })
        .from(clippings)
        .where(and(eq(clippings.createdBy, user.id), activeClipping))
        .groupBy(sql`to_char(${clippings.createdAt}, 'YYYY-MM')`)
        .orderBy(asc(sql`to_char(${clippings.createdAt}, 'YYYY-MM')`))
      const timeline = await booksForUser(
        user.id,
        { limit: 100, offset: 0 },
        context.userId
      )
      return {
        daily,
        monthly,
        timelineLastYear: timeline.map((book) => ({
          bookDoubanID: book.doubanId,
          clippingsCount: book.clippingsCount,
          startAt: date(book.startReadingAt),
          lastAt: date(book.lastReadingAt),
        })),
      }
    },
    followers: async (user: User) => {
      const rows = await db()
        .select({ user: users })
        .from(userConnects)
        .innerJoin(users, eq(users.id, userConnects.owner))
        .where(
          and(
            eq(userConnects.target, user.id),
            eq(userConnects.connectType, 0),
            activeUser
          )
        )
      return rows.map((row) => row.user)
    },
    isFan: async (user: User, _args: Args, context: GraphQLContext) => {
      if (!context.userId) return false
      if (context.userId === user.id) return true
      return Boolean(
        await db().query.userConnects.findFirst({
          where: and(
            eq(userConnects.owner, context.userId),
            eq(userConnects.target, user.id),
            eq(userConnects.connectType, 0)
          ),
        })
      )
    },
    webhooks: (user: User, _args: Args, context: GraphQLContext) =>
      context.userId === user.id
        ? db()
            .select()
            .from(webHooks)
            .where(eq(webHooks.owner, user.id))
            .orderBy(desc(webHooks.id))
        : [],
    externalInfo: async (user: User, _args: Args, context: GraphQLContext) => {
      if (context.userId !== user.id)
        return { githubBound: false, appleUnique: '', address: [] }
      const [external, addresses] = await Promise.all([
        db().query.externalAccounts.findFirst({
          where: eq(externalAccounts.userId, user.id),
        }),
        db()
          .select()
          .from(web3Addresses)
          .where(eq(web3Addresses.userAddress, user.id)),
      ])
      return {
        githubBound: Boolean(external?.githubAccessToken),
        appleUnique: external?.appleUnique ?? '',
        address: addresses.map((item) => item.address),
      }
    },
    nfts: async (user: User) => {
      const rows = await db().select().from(nfts).where(eq(nfts.owner, user.id))
      const edges = rows.flatMap((row) => row.nfts)
      return { count: edges.length, edges }
    },
    personalityByAI: async (user: User) => {
      const recent = await db()
        .select({ content: clippings.content })
        .from(clippings)
        .where(and(eq(clippings.createdBy, user.id), activeClipping))
        .orderBy(desc(clippings.id))
        .limit(30)
      if (!recent.length) return ''
      try {
        return await promptPalExecute('PQDE7LRNqgkl', {
          clippings: recent.map((row) => row.content).join('\n'),
        })
      } catch {
        return ''
      }
    },
  },
  DeviceInfo: { createdAt: (item: Args) => date(item.createdAt) },
  Order: {
    orderID: (item: Args) => item.orderId,
    orderCreatedAt: (item: Args) => date(item.orderCreatedAt),
  },
  NftItem: {
    tokenAddress: (item: Args) => item.token_address,
    tokenID: (item: Args) => item.token_id,
    ownerOf: (item: Args) => item.owner_of,
    blockNumber: (item: Args) => item.block_number,
    blockNumberMinted: (item: Args) => item.block_number_minted,
    tokenHash: (item: Args) => item.token_hash,
    contractType: (item: Args) => item.contract_type,
    tokenURI: (item: Args) => item.token_uri,
    lastTokenURISync: (item: Args) => item.last_token_uri_sync,
    lastMetadataSync: (item: Args) => item.last_metadata_sync,
  },
  Book: {
    startReadingAt: (book: Book) => date(book.startReadingAt),
    lastReadingAt: (book: Book) => date(book.lastReadingAt),
    isLastReadingBook: (book: Book) => book.isLastReadingBook ?? false,
    clippings: (book: Book, _args: Args, context: GraphQLContext) => {
      const pagination = book.pagination ?? { limit: 100, offset: 0 }
      return db()
        .select()
        .from(clippings)
        .where(
          and(
            eq(clippings.createdBy, book.uid),
            eq(clippings.bookId, book.doubanId),
            activeClipping,
            clippingVisibleTo(context.userId)
          )
        )
        .orderBy(desc(clippings.id))
        .limit(pagination.limit)
        .offset(pagination.offset)
    },
    randoms: (book: Book) =>
      db()
        .select()
        .from(clippings)
        .where(
          and(
            eq(clippings.bookId, book.doubanId),
            eq(clippings.visible, true),
            activeClipping
          )
        )
        .orderBy(sql`random()`)
        .limit(5),
  },
  Clipping: {
    bookID: (clipping: Clipping) => clipping.bookId,
    createdAt: (clipping: Clipping) => date(clipping.createdAt),
    source: (clipping: Clipping) => sourceToEnum(clipping.source),
    creator: (clipping: Clipping) => userById(clipping.createdBy),
    richContent: async (clipping: Clipping) => {
      const nounIds = Array.isArray(clipping.nouns) ? clipping.nouns : []
      const nounRows = nounIds.length
        ? await db().select().from(nouns).where(inArray(nouns.id, nounIds))
        : []
      const activeNouns = nounRows.filter((noun) => noun.scope !== 3)
      const pattern = activeNouns
        .map((noun) => noun.noun.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .filter(Boolean)
        .join('|')
      const segments = pattern
        ? clipping.content.split(new RegExp(`(${pattern})`, 'giu'))
        : [clipping.content]
      return {
        html: htmlEscape(clipping.content).replaceAll('\n', '<br />'),
        plain: clipping.content,
        segments,
        nouns: activeNouns,
      }
    },
    comments: (clipping: Clipping) => loadComments({ clippingId: clipping.id }),
    reactions: (clipping: Clipping) =>
      db()
        .select()
        .from(reactions)
        .where(
          and(
            eq(reactions.target, 0),
            eq(reactions.targetId, clipping.id),
            isNull(reactions.deletedAt)
          )
        )
        .orderBy(desc(reactions.id)),
    reactionData: async (
      clipping: Clipping,
      _args: Args,
      context: GraphQLContext
    ) => {
      const rows = await db()
        .select()
        .from(reactions)
        .where(
          and(
            eq(reactions.target, 0),
            eq(reactions.targetId, clipping.id),
            isNull(reactions.deletedAt)
          )
        )
        .orderBy(desc(reactions.id))
      const grouped = Map.groupBy(rows, (row) => row.symbol)
      return {
        count: rows.length,
        symbolCounts: [...grouped.entries()].map(([symbol, items]) => {
          const recent = items.slice(0, 5)
          const ownReaction = items.find(
            (item) => item.creator === context.userId
          )
          if (ownReaction && !recent.some((item) => item.id === ownReaction.id))
            recent[recent.length - 1] = ownReaction
          return {
            symbol,
            count: items.length,
            done: Boolean(ownReaction),
            recently: recent,
          }
        }),
      }
    },
    prevClipping: async (clipping: Clipping) => {
      const [userPrev, bookPrev] = await Promise.all([
        db().query.clippings.findFirst({
          where: and(
            eq(clippings.createdBy, clipping.createdBy),
            lt(clippings.id, clipping.id),
            activeClipping
          ),
          orderBy: desc(clippings.id),
        }),
        db().query.clippings.findFirst({
          where: and(
            eq(clippings.bookId, clipping.bookId),
            lt(clippings.id, clipping.id),
            activeClipping
          ),
          orderBy: desc(clippings.id),
        }),
      ])
      return {
        userClippingID: userPrev?.id ?? 0,
        bookClippingID: bookPrev?.id ?? 0,
      }
    },
    nextClipping: async (clipping: Clipping) => {
      const [userNext, bookNext] = await Promise.all([
        db().query.clippings.findFirst({
          where: and(
            eq(clippings.createdBy, clipping.createdBy),
            sql`${clippings.id} > ${clipping.id}`,
            activeClipping
          ),
          orderBy: asc(clippings.id),
        }),
        db().query.clippings.findFirst({
          where: and(
            eq(clippings.bookId, clipping.bookId),
            sql`${clippings.id} > ${clipping.id}`,
            activeClipping
          ),
          orderBy: asc(clippings.id),
        }),
      ])
      return {
        userClippingID: userNext?.id ?? 0,
        bookClippingID: bookNext?.id ?? 0,
      }
    },
    aiSummary: async (clipping: Clipping) => {
      try {
        return await promptPalExecute('w4XVBg0NoYGb', {
          bookName: clipping.title,
          clipping: clipping.content,
          content: '',
        })
      } catch {
        return ''
      }
    },
  },
  Comment: {
    belongsTo: (comment: Comment) => clippingById(comment.belongsTo),
    creator: (comment: Comment) => userById(comment.createdBy),
    replyTo: async (comment: Comment) => {
      if (comment.replyTo <= 0) return null
      const parent = await db().query.comments.findFirst({
        where: eq(comments.id, comment.replyTo),
      })
      return parent ? userById(parent.createdBy) : null
    },
    createdAt: (comment: Comment) => date(comment.createdAt),
    updatedAt: (comment: Comment) => date(comment.updatedAt),
    deletedAt: (comment: Comment) => date(comment.deletedAt),
  },
  Reaction: {
    creator: (reaction: Reaction) => userById(reaction.creator),
    target: (reaction: Reaction) => targetToEnum(reaction.target),
    createdAt: (reaction: Reaction) => date(reaction.createdAt),
    updatedAt: (reaction: Reaction) => date(reaction.updatedAt),
  },
  Noun: {
    bookId: (noun: Noun) => noun.bookId || null,
    clipping: (noun: Noun) =>
      noun.clippingId > 0 ? clippingById(noun.clippingId) : null,
    updaters: (noun: Noun) =>
      noun.updaters.length
        ? db()
            .select()
            .from(users)
            .where(and(inArray(users.id, noun.updaters), activeUser))
        : [],
    scope: (noun: Noun) => scopeToEnum(noun.scope),
    creator: (noun: Noun) =>
      userById(assertFound(noun.userNouns, 'noun creator not found')),
    createdAt: (noun: Noun) => date(noun.createdAt),
    updatedAt: (noun: Noun) => date(noun.updatedAt),
  },
  WebHookItem: {
    step: () => 'onCreateClippings',
    records: async (hook: Args) => {
      const rows = await db()
        .select()
        .from(webHookRecords)
        .where(eq(webHookRecords.webHookRecords, hook.id))
        .orderBy(desc(webHookRecords.id))
        .limit(50)
      return { count: rows.length, records: rows }
    },
  },
  WebHookRecord: {
    requestHeaders: (record: Args) => JSON.stringify(record.requestHeaders),
    requestIP: (record: Args) => record.requestIp,
    startTime: (record: Args) => date(record.startTime),
    endTime: (record: Args) => date(record.endTime),
  },
}
