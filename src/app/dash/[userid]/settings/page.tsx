import { redirect } from 'next/navigation'

import { dashHref } from '@/utils/profile.utils'

type PageProps = {
  params: Promise<{ userid: string }>
}

export default async function SettingsIndex({ params }: PageProps) {
  const { userid } = await params
  redirect(dashHref(decodeURIComponent(userid), 'settings/web'))
}
