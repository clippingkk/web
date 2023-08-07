import i18next from 'i18next'
import React from 'react'
import DashboardContainer from '../../components/dashboard-container/container'
import NavigateGuide from '../../components/navigation-bar/navigate-guide'
// import OGWithPricing from '../../components/og/og-with-pricing'
// import page from '../page'

export const runtime = 'edge'

type LayoutProps = {
  children: React.ReactNode
}

function Layout(props: LayoutProps) {
  return (
    <DashboardContainer header={<NavigateGuide title={i18next.t('app.plan.premium.name') ?? ''} />}>
      {props.children}
    </DashboardContainer>
  )
}

export default Layout
