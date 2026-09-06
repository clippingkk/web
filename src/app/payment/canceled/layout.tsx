import type React from 'react'

import { currentUserId } from '@/server/gate/current'

import DashboardContainer from '../../../components/dashboard-container/container'
import NavigateGuide from '../../../components/navigation-bar/navigate-guide'

type LayoutProps = {
  children: React.ReactNode
}

// export const metadata: Metadata = {
//   title: 'ClippingKK support information',
//   openGraph: {
//     title: 'ClippingKK support information',
//   }
// }

const Layout = async (props: LayoutProps) => {
  const myUid = (await currentUserId())?.toString()
  return (
    <DashboardContainer
      uidOrDomain={myUid}
      header={
        <NavigateGuide uid={myUid ? ~~myUid : undefined} title="Canceled" />
      }
    >
      {props.children}
    </DashboardContainer>
  )
}

export default Layout
