import React from 'react'
import DashboardContainer from '../../../components/dashboard-container/container'
import NavigateGuide from '../../../components/navigation-bar/navigate-guide'
import { cookies } from 'next/headers'
import { USER_ID_KEY } from '@/constants/storage'

type LayoutProps = {
  children: React.ReactNode
}

const Layout = async (props: LayoutProps) => {
  const cs = await cookies()
  const myUid = cs.get(USER_ID_KEY)?.value
  return (
    <DashboardContainer uidOrDomain={myUid} header={<NavigateGuide uid={myUid ? ~~myUid : undefined} title='Success' />}>
      {props.children}
    </DashboardContainer>
  )
}

export default Layout
