'use server'

import { cookies } from "next/headers"

// remove cookies on server
export async function onCleanServerCookie() {
  const cs = cookies()
  await cs.delete('token')
  await cs.delete('uid')
}

