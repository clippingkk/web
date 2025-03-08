import React from 'react'
import { useTranslation } from 'react-i18next'
import CommonFeatures from './common-features'
import { HardDrive, Sparkles, Phone, LifeBuoy, Check } from 'lucide-react'

type FreePlanFeaturesProps = {
  children?: React.ReactNode
}

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className='mb-6 flex items-start'>
      <Check className="h-5 w-5 mr-3 text-emerald-400 mt-1 flex-shrink-0" />
      <span>{children}</span>
    </li>
  )
}

function FreePlanFeatures(props: FreePlanFeaturesProps) {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <ul className='text-lg space-y-4'>
        <li className='flex items-start'>
          <HardDrive className="h-5 w-5 mr-3 text-blue-400 mt-1 flex-shrink-0" />
          <span>{t('app.plan.free.features.storage')}</span>
        </li>
        <li className='flex items-start'>
          <Sparkles className="h-5 w-5 mr-3 text-purple-400 mt-1 flex-shrink-0" />
          <span>{t('app.plan.free.features.ai')}</span>
        </li>
        <CommonFeatures />
        <li className='flex items-start'>
          <Phone className="h-5 w-5 mr-3 text-indigo-400 mt-1 flex-shrink-0" />
          <span>{t('app.plan.free.features.ios')}</span>
        </li>
        <li className='flex items-start'>
          <LifeBuoy className="h-5 w-5 mr-3 text-orange-400 mt-1 flex-shrink-0" />
          <span>{t('app.plan.free.features.support')}</span>
        </li>
      </ul>
      <div className="mt-8">
        {props.children}
      </div>
    </div>
  )
}

export default FreePlanFeatures
