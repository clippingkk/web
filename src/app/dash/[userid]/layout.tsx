import type { Metadata } from 'next'
import type React from 'react'

import AppShell from '@/components/shell/app-shell'
import type { ShellViewer } from '@/components/shell/types'
import { getViewer } from '@/server/data/viewer'

type LayoutProps = {
  children: React.ReactNode
}

export const metadata: Metadata = {
  title: 'ClippingKK dashboard',
  openGraph: {
    title: 'ClippingKK dashboard',
  },
}

async function shellViewer(): Promise<ShellViewer | null> {
  const viewer = await getViewer()
  return viewer
    ? {
        id: viewer.id,
        name: viewer.name,
        avatar: viewer.avatar,
        slug: viewer.slug,
        isPremium: viewer.isPremium,
        isAdmin: viewer.isAdmin,
      }
    : null
}

function Layout(props: LayoutProps) {
  return <AppShell viewer={shellViewer()}>{props.children}</AppShell>
}

export default Layout
