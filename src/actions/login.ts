'use server'
import dayjs from 'dayjs'
import { cookies } from 'next/headers'

// on server
export async function syncLoginStateToServer(data: { uid: number, token: string }) {
  const { uid, token } = data
  const expires = dayjs().add(1, 'year').toDate()
  const ck = await cookies()
  ck.set('token', token, { expires, httpOnly: true })
  ck.set('uid', uid.toString(), { expires, httpOnly: true })
}
