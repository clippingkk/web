import React from 'react'
import DashboardContainer from '../../../components/dashboard-container/container'
import { Metadata } from 'next'
import { cookies } from 'next/headers'

type LayoutProps = {
  children: React.ReactNode
}

export const metadata: Metadata = {
  title: 'ClippingKK dashboard',
  openGraph: {
    title: 'ClippingKK dashboard',
  }
}

const Layout = async (props: LayoutProps) => {
  const cs = await cookies()
  const myUid = cs.get('uid')?.value
  return (
    <DashboardContainer uidOrDomain={myUid}>
      {props.children}
    </DashboardContainer>
  )
}

export default Layout
