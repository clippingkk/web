'use server'
import dayjs from 'dayjs'
import { cookies } from 'next/headers'
import { COOKIE_TOKEN_KEY, USER_ID_KEY } from '../constants/storage'

// on server
export async function syncLoginStateToServer(data: {
  uid: number
  token: string
}) {
  'use server'
  const { uid, token } = data
  const expires = dayjs().add(1, 'year').toDate()
  const ck = await cookies()
  ck.set(COOKIE_TOKEN_KEY, token, { expires, httpOnly: true })
  ck.set(USER_ID_KEY, uid.toString(), { expires, httpOnly: true })
}
