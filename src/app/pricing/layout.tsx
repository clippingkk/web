import React from 'react'
import { useTranslation } from '@/i18n'
import DashboardContainer from '../../components/dashboard-container/container'
import NavigateGuide from '../../components/navigation-bar/navigate-guide'
import { cookies } from 'next/headers'
// import OGWithPricing from '../../components/og/og-with-pricing'
// import page from '../page'

type LayoutProps = {
  children: React.ReactNode
}

async function Layout(props: LayoutProps) {
  const cs = await cookies()
  const myUid = cs.get('uid')?.value
  const { t } = await useTranslation()
  return (
    <DashboardContainer uidOrDomain={myUid} header={<NavigateGuide uid={myUid ? ~~myUid : undefined} title={t('app.plan.premium.name') ?? ''} />}>
      {props.children}
    </DashboardContainer>
  )
}

export default Layout
