import type React from 'react'

import { getTranslation } from '@/i18n'
import { currentUserId } from '@/server/gate/current'

import DashboardContainer from '../../components/dashboard-container/container'
import NavigateGuide from '../../components/navigation-bar/navigate-guide'

// import OGWithPricing from '../../components/og/og-with-pricing'
// import page from '../page'

type LayoutProps = {
  children: React.ReactNode
}

async function Layout(props: LayoutProps) {
  const myUid = (await currentUserId())?.toString()
  const { t } = await getTranslation()
  return (
    <DashboardContainer
      uidOrDomain={myUid}
      header={
        <NavigateGuide
          uid={myUid ? ~~myUid : undefined}
          title={t('app.plan.premium.name') ?? ''}
        />
      }
    >
      {props.children}
    </DashboardContainer>
  )
}

export default Layout
