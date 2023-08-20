import React from 'react'
import Loading2Icon from '../../../components/icons/loading2.svg'
import { useTranslation } from 'react-i18next'

type DashboardLoadingPageProps = {
}

function DashboardLoadingPage(props: DashboardLoadingPageProps) {
  return (
    <div className='w-full h-full flex flex-col justify-center items-center min-h-screen'>
      <Loading2Icon />
      <span>Loading...</span>
    </div>
  )
}

export default DashboardLoadingPage
