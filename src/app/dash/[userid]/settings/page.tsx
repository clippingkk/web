import { redirect } from 'next/navigation'

import { safeDecode } from '@/server/data/current-path'
import { dashHref } from '@/utils/profile.utils'

type PageProps = {
  params: Promise<{ userid: string }>
}

export default async function SettingsIndex({ params }: PageProps) {
  const { userid } = await params
  redirect(dashHref(safeDecode(userid), 'settings/web'))
}
