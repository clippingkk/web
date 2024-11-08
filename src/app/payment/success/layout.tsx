import React from 'react'
import DashboardContainer from '../../../components/dashboard-container/container'
import NavigateGuide from '../../../components/navigation-bar/navigate-guide'
import { cookies } from 'next/headers'

type LayoutProps = {
  params: any
  children: React.ReactNode
}

const Layout = async (props: LayoutProps) => {
  const cs = await cookies()
  const myUid = cs.get('uid')?.value
  return (
    <DashboardContainer uidOrDomain={myUid} header={<NavigateGuide title='Success' />}>
      {props.children}
    </DashboardContainer>
  )
}

export default Layout
