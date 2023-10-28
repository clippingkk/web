import React from 'react'
import DashboardContainer from '../../../components/dashboard-container/container'
import { Metadata } from 'next'

type LayoutProps = {
  children: React.ReactNode
}

export const metadata: Metadata = {
  title: 'ClippingKK support information',
  openGraph: {
    title: 'ClippingKK support information',
  }
}

const Layout = (props: LayoutProps) => {
  return (
    <DashboardContainer>
      {props.children}
    </DashboardContainer>
  )
}

export default Layout
