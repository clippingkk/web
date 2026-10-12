import { createHash, randomInt, timingSafeEqual } from 'node:crypto'

import { and, count, desc, eq, isNotNull, isNull, sql } from 'drizzle-orm'
import { z } from 'zod'

import { getDatabase } from '../db'
import { emailBindings, users, type EmailBinding } from '../db/schema'
import { ApiError } from '../errors'
import { sendEmailBindingCode } from '../integrations'
import { rateLimit } from '../redis'

/**
 * The addresses a reader imports Kindle notebook exports from. Adding one mails
 * a 6-digit code to it; the address imports only once the reader enters that
 * code, and a verified address belongs to exactly one reader.
 *
 * The code is stored as a sha256, which hides it from a casual look at the
 * table but not from a brute force over a million values: the expiry and the
 * attempt cap are what protect it.
 */
export const MAX_EMAIL_BINDINGS = 10
const CODE_TTL_MS = 30 * 60 * 1000
const MAX_CODE_ATTEMPTS = 5
const HOUR = 60 * 60

const db = () => getDatabase().db
const sha256 = (value: string) =>
  createHash('sha256').update(value).digest('hex')
const codeHash = (email: string, code: string) => sha256(`${email}\n${code}`)
const emailSchema = z.email().max(255)

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

/** The address in a From or To header (`Name <reader@example.com>`), or null. */
export function parseEmailAddress(value: string) {
  const angle = value.match(/<([^<>]*)>[^<>]*$/)
  const email = normalizeEmail(angle ? angle[1] : value)
  return emailSchema.safeParse(email).success ? email : null
}

export interface EmailBindingSummary {
  id: number
  email: string
  verified: boolean
  lastImportedAt: string | null
  createdAt: string
}

function summary(row: EmailBinding): EmailBindingSummary {
  return {
    id: row.id,
    email: row.email,
    verified: row.verifiedAt !== null,
    lastImportedAt: row.lastImportedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  }
}

/** The reader's addresses, newest first. */
export async function listEmailBindings(userId: number) {
  const rows = await db()
    .select()
    .from(emailBindings)
    .where(eq(emailBindings.userId, userId))
    .orderBy(desc(emailBindings.id))
  return rows.map(summary)
}

/**
 * Adds a pending address and mails it a code. Adding a pending address again
 * replaces its code with a fresh one, which is how the reader asks to resend.
 */
export async function requestEmailBinding(userId: number, input: string) {
  const email = normalizeEmail(input)
  if (!emailSchema.safeParse(email).success)
    throw new ApiError('Enter a valid email address.', 400, 'INVALID_EMAIL')

  const [own] = await db()
    .select()
    .from(emailBindings)
    .where(
      and(eq(emailBindings.userId, userId), eq(emailBindings.email, email))
    )
  if (own?.verifiedAt)
    throw new ApiError(
      'This address is already verified.',
      409,
      'ALREADY_VERIFIED'
    )
  // Whether another reader holds the address is only revealed at verify
  // time, to someone who proved they own it; asking here would let any
  // signed-in reader probe which addresses are bound.
  if (!own) {
    const [{ total }] = await db()
      .select({ total: count() })
      .from(emailBindings)
      .where(eq(emailBindings.userId, userId))
    if (total >= MAX_EMAIL_BINDINGS)
      throw new ApiError(
        `You can bind at most ${MAX_EMAIL_BINDINGS} addresses. Remove one first.`,
        409,
        'TOO_MANY_EMAIL_BINDINGS'
      )
  }

  // Per reader, and per address so no one can use this to flood an inbox.
  const [byReader, byAddress] = await Promise.all([
    rateLimit(`ck:email-binding:send:u:${userId}`, 5, HOUR),
    rateLimit(`ck:email-binding:send:a:${sha256(email)}`, 3, HOUR),
  ])
  if (!byReader.allowed || !byAddress.allowed)
    throw new ApiError(
      'Too many codes sent. Try again in an hour.',
      429,
      'TOO_MANY_CODES'
    )

  const code = String(randomInt(0, 1_000_000)).padStart(6, '0')
  const pending = {
    codeHash: codeHash(email, code),
    codeExpiresAt: new Date(Date.now() + CODE_TTL_MS),
    codeAttempts: 0,
  }
  const [row] = await db()
    .insert(emailBindings)
    .values({ userId, email, ...pending })
    .onConflictDoUpdate({
      target: [emailBindings.userId, emailBindings.email],
      set: pending,
    })
    .returning()
  try {
    await sendEmailBindingCode(email, code)
  } catch (error) {
    // Don't leave a live code the reader never received; asking again sends
    // a fresh one.
    await db()
      .update(emailBindings)
      .set({ codeHash: null, codeExpiresAt: null })
      .where(eq(emailBindings.id, row.id))
    throw error
  }
  return summary(row)
}

function isUniqueViolation(error: unknown) {
  const pg = error as { code?: string; cause?: { code?: string } }
  return (pg?.code ?? pg?.cause?.code) === '23505'
}

function sameHash(a: string, b: string) {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

export async function verifyEmailBinding(
  userId: number,
  id: number,
  code: string
) {
  const owned = and(eq(emailBindings.id, id), eq(emailBindings.userId, userId))
  const [current] = await db().select().from(emailBindings).where(owned)
  if (!current) throw new ApiError('address not found', 404)
  if (current.verifiedAt) return summary(current)

  // Count the attempt before comparing, so parallel guesses can't share one.
  const [row] = await db()
    .update(emailBindings)
    .set({ codeAttempts: sql`${emailBindings.codeAttempts} + 1` })
    .where(and(owned, isNull(emailBindings.verifiedAt)))
    .returning()
  if (!row) throw new ApiError('address not found', 404)
  if (row.codeAttempts > MAX_CODE_ATTEMPTS)
    throw new ApiError(
      'Too many wrong codes. Send a new one.',
      429,
      'TOO_MANY_ATTEMPTS'
    )
  if (!row.codeHash || !row.codeExpiresAt || row.codeExpiresAt <= new Date())
    throw new ApiError(
      'This code has expired. Send a new one.',
      400,
      'CODE_EXPIRED'
    )
  if (!sameHash(row.codeHash, codeHash(row.email, code)))
    throw new ApiError('That code is not right.', 400, 'INVALID_CODE')

  try {
    const [verified] = await db()
      .update(emailBindings)
      .set({
        verifiedAt: new Date(),
        codeHash: null,
        codeExpiresAt: null,
        codeAttempts: 0,
      })
      .where(eq(emailBindings.id, row.id))
      .returning()
    return summary(verified)
  } catch (error) {
    // Another reader verified the same address first.
    if (isUniqueViolation(error))
      throw new ApiError(
        'This address is bound to another account.',
        409,
        'EMAIL_ALREADY_BOUND'
      )
    throw error
  }
}

export async function removeEmailBinding(userId: number, id: number) {
  const removed = await db()
    .delete(emailBindings)
    .where(and(eq(emailBindings.id, id), eq(emailBindings.userId, userId)))
    .returning({ id: emailBindings.id })
  if (!removed.length) throw new ApiError('address not found', 404)
}

/** The verified binding for a sender address whose reader still exists. */
export async function findVerifiedBinding(email: string) {
  const [row] = await db()
    .select({ id: emailBindings.id, userId: emailBindings.userId })
    .from(emailBindings)
    .innerJoin(users, eq(users.id, emailBindings.userId))
    .where(
      and(
        eq(emailBindings.email, normalizeEmail(email)),
        isNotNull(emailBindings.verifiedAt),
        isNull(users.deletedAt)
      )
    )
    .limit(1)
  return row ?? null
}

export async function markEmailImported(bindingId: number) {
  await db()
    .update(emailBindings)
    .set({ lastImportedAt: new Date() })
    .where(eq(emailBindings.id, bindingId))
}
