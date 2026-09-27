import type { Metadata } from 'next'
import type React from 'react'

import MarketingShell from '@/components/shell/marketing-shell'

type LayoutProps = {
  children: React.ReactNode
}

export const metadata: Metadata = {
  title: 'ClippingKK support information',
  openGraph: {
    title: 'ClippingKK support information',
  },
}

function Layout(props: LayoutProps) {
  return <MarketingShell>{props.children}</MarketingShell>
}

export default Layout
