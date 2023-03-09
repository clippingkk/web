import React from 'react'
import DashboardContainer from '../../components/dashboard-container/container'
import NavigateGuide from '../../components/navigation-bar/navigate-guide'

type CanceledPageProps = {
}

function CanceledPage(props: CanceledPageProps) {
  return (
    <div>CanceledPage</div>
  )
}

CanceledPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <DashboardContainer header={<NavigateGuide title='Canceled' />}>
      {page}
    </DashboardContainer>
  )
}

export default CanceledPage
