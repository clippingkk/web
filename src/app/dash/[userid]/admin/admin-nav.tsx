'use client'

import NavTabs from '@annatarhe/lake-ui/nav-tabs'
import { BookDashed, Inbox } from 'lucide-react'
import Link from 'next/link'

import { useTranslation } from '@/i18n/client'
import { dashHref } from '@/utils/profile.utils'

const SECTIONS = [
  { key: 'books', section: 'admin', icon: BookDashed },
  { key: 'inbound', section: 'admin/inbound-emails', icon: Inbox },
] as const

type AdminNavProps = {
  slug: string
  active: (typeof SECTIONS)[number]['key']
}

/** Rendered by each admin page after its own check, never by a layout. */
function AdminNav({ slug, active }: AdminNavProps) {
  const { t } = useTranslation(undefined, 'settings')
  return (
    <div className="no-scrollbar -mx-4 overflow-x-auto px-4">
      <NavTabs
        aria-label={t('admin.nav.label')}
        variant="pill"
        items={SECTIONS.map(({ key, section, icon: Icon }) => ({
          key,
          label: t(`admin.nav.${key}`),
          icon: <Icon className="size-4" aria-hidden="true" />,
          active: active === key,
          render: <Link href={dashHref(slug, section)} />,
        }))}
      />
    </div>
  )
}

export default AdminNav
