import React from 'react'
import DashboardContainer from '../../../components/dashboard-container/container'
import NavigateGuide from '../../../components/navigation-bar/navigate-guide'

type LayoutProps = {
  params: any
  children: React.ReactNode
}

const Layout = (props: LayoutProps) => {
  return (
    <DashboardContainer header={<NavigateGuide title='Success' />}>
      {props.children}
    </DashboardContainer>
  )
}

export default Layout
