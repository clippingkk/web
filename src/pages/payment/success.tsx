import { useRouter } from 'next/router'
import React from 'react'
import DashboardContainer from '../../components/dashboard-container/container'
import NavigateGuide from '../../components/navigation-bar/navigate-guide'

type PaymentSuccessPageProps = {
}

function PaymentSuccessPage(props: PaymentSuccessPageProps) {
  const q = useRouter().query

  console.log(q)

  return (
    <div>PaymentSuccessPage</div>
  )
}

PaymentSuccessPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <DashboardContainer header={<NavigateGuide title='Success' />}>
      {page}
    </DashboardContainer>
  )
}


export default PaymentSuccessPage
