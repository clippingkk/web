import React from 'react'
import { Metadata } from 'next'
import DashboardContainer from '../../../components/dashboard-container/container'
import NavigateGuide from '../../../components/navigation-bar/navigate-guide'

type LayoutProps = {
  params: any
  children: React.ReactNode
}

// export const metadata: Metadata = {
//   title: 'ClippingKK support information',
//   openGraph: {
//     title: 'ClippingKK support information',
//   }
// }

const Layout = (props: LayoutProps) => {
  return (
    <DashboardContainer header={<NavigateGuide title='Canceled' />}>
      {props.children}
    </DashboardContainer>
  )
}

export default Layout
