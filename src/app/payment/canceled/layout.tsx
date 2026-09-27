import type React from 'react'

import MarketingShell from '@/components/shell/marketing-shell'

type LayoutProps = {
  children: React.ReactNode
}

function Layout(props: LayoutProps) {
  return <MarketingShell>{props.children}</MarketingShell>
}

export default Layout
