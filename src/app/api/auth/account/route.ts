import { NextResponse } from 'next/server'

import { requireUserId } from '@/server/auth'
import { gateConfig } from '@/server/gate/config'
import { route } from '@/server/http'
export const GET = route(async (request) => {
  await requireUserId(request)
  return NextResponse.redirect(`${gateConfig().baseUrl}/account`)
}, 'auth.gate.manage')
