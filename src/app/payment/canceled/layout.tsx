import React from 'react'
import DashboardContainer from '../../../components/dashboard-container/container'
import NavigateGuide from '../../../components/navigation-bar/navigate-guide'
import { cookies } from 'next/headers'

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
  const cs = await cookies()
  const myUid = cs.get('uid')?.value
  return (
    <DashboardContainer uidOrDomain={myUid} header={<NavigateGuide uid={myUid ? ~~myUid : undefined} title='Canceled' />}>
      {props.children}
    </DashboardContainer>
  )
}

export default Layout
