import { and, desc, eq, isNull } from 'drizzle-orm'
import { connection } from 'next/server'

import { getDatabase } from '@/server/db'
import { clippings, users } from '@/server/db/schema'
import { getServerEnv } from '@/server/env'
import { ApiError } from '@/server/errors'

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ uid: string }> }
) {
  await connection()
  const uid = Number((await context.params).uid)
  if (!Number.isInteger(uid) || uid <= 0)
    throw new ApiError('user id not found')
  const user = await getDatabase().db.query.users.findFirst({
    where: eq(users.id, uid),
  })
  if (!user) throw new ApiError('user not found', 404)
  const limit = user.premiumEndAt && user.premiumEndAt > new Date() ? 100 : 30
  const rows = await getDatabase()
    .db.select()
    .from(clippings)
    .where(
      and(
        eq(clippings.createdBy, uid),
        eq(clippings.visible, true),
        isNull(clippings.deletedAt)
      )
    )
    .orderBy(desc(clippings.id))
    .limit(limit)
  const origin = getServerEnv().APP_ORIGIN
  const entries = rows
    .map(
      (clipping) => `<entry>
  <title>${escapeXml(clipping.title)}</title>
  <link href="${origin}/dash/${uid}/clippings/${clipping.id}" />
  <id>${origin}/dash/${uid}/clippings/${clipping.id}</id>
  <updated>${clipping.updatedAt.toISOString()}</updated>
  <content type="html">${escapeXml(clipping.content)}</content>
</entry>`
    )
    .join('\n')
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(user.name)} 的摘录</title>
  <link href="${origin}/dash/${uid}/profile" />
  <id>${origin}/api/rss/user/${uid}/clippings</id>
  <updated>${(rows[0]?.updatedAt ?? user.updatedAt).toISOString()}</updated>
  <subtitle>${escapeXml(user.bio)}</subtitle>
  ${entries}
</feed>`
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  })
}
