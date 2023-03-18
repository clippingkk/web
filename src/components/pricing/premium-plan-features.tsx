import { HoverCard, Text } from '@mantine/core'
import React from 'react'
import { useTranslation } from 'react-i18next'
import CommonFeatures from './common-features'
import DeveloperFeatures from './developer-features'
import FreePlanFeatures from './free-plan-features'

type PremiumPlanFeaturesProps = {
  children?: React.ReactNode
}

function PremiumPlanFeatures(props: PremiumPlanFeaturesProps) {
  const { t } = useTranslation()
  return (
    <ul className=' text-xl'>
      <li className='mb-4'>
        {t('app.plan.premium.features.storage')}
      </li>
      <li className='mb-4'>
        {t('app.plan.premium.features.ai')}
      </li>
      <li className='mb-4'>
        {t('app.plan.premium.features.ios')}
      </li>
      <CommonFeatures />
      <DeveloperFeatures />
      <li className='mb-4'>
        {t('app.plan.premium.features.rss')}
      </li>
      <li className='mb-4'>
        {t('app.plan.premium.features.support')}
      </li>
      {props.children}
    </ul>
  )
}

export default PremiumPlanFeatures
