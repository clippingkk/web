import type { Metadata } from 'next'
import type React from 'react'

import DashboardContainer from '@/components/dashboard-container/container'
import { currentUserId } from '@/server/gate/current'

type LayoutProps = {
  children: React.ReactNode
}

export const metadata: Metadata = {
  title: 'ClippingKK support information',
  openGraph: {
    title: 'ClippingKK support information',
  },
}

const Layout = async (props: LayoutProps) => {
  const myUid = (await currentUserId())?.toString()
  return (
    <DashboardContainer uidOrDomain={myUid}>
      {props.children}
    </DashboardContainer>
  )
}

export default Layout
