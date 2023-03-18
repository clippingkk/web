import React from 'react'
import { useTranslation } from 'react-i18next'
import CommonFeatures from './common-features'

type FreePlanFeaturesProps = {
  children?: React.ReactNode
}

function FreePlanFeatures(props: FreePlanFeaturesProps) {
  const { t } = useTranslation()
  return (
    <ul className=' text-xl'>
      <li className='mb-4'>
        {t('app.plan.free.features.storage')}
      </li>
      <li className='mb-4'>
        {t('app.plan.free.features.ai')}
      </li>
      <CommonFeatures />
      <li className='mb-4'>
        {t('app.plan.free.features.ios')}
      </li>
      <li className='mb-4'>
        {t('app.plan.free.features.support')}
      </li>
      {props.children}
    </ul>
  )
}

export default FreePlanFeatures
