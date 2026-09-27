import type { Metadata } from 'next'
import type React from 'react'

import AppShell from '@/components/shell/app-shell'
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

async function Layout(props: LayoutProps) {
  const viewer = await getViewer()
  return (
    <AppShell
      viewer={
        viewer
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
    >
      {props.children}
    </AppShell>
  )
}

export default Layout
