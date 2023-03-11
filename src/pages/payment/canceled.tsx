import React from 'react'
import { Text } from '@mantine/core'
import DashboardContainer from '../../components/dashboard-container/container'
import NavigateGuide from '../../components/navigation-bar/navigate-guide'
import Link from 'next/link'

type CanceledPageProps = {
}

function CanceledPage(props: CanceledPageProps) {
  return (
    <div className=' w-full h-full flex flex-col items-center justify-center dark:text-gray-100 pt-20'>
      <Text>
        Sorry we could not process your payment, please try again
      </Text>
      <Link href='/pricing' className='mt-8'>
        go to plans
      </Link>
    </div>
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
