import { Check, HardDrive, LifeBuoy, Phone, Sparkles } from 'lucide-react'
import type React from 'react'

import { getTranslation } from '@/i18n'

import CommonFeatures from './common-features'

type FreePlanFeaturesProps = {
  children?: React.ReactNode
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="mb-6 flex items-start">
      <Check className="mt-1 mr-3 h-5 w-5 flex-shrink-0 text-emerald-400" />
      <span>{children}</span>
    </li>
  )
}

async function FreePlanFeatures(props: FreePlanFeaturesProps) {
  const { t } = await getTranslation()
  return (
    <div className="space-y-6">
      <ul className="space-y-4 text-lg">
        <li className="flex items-start">
          <HardDrive className="mt-1 mr-3 h-5 w-5 flex-shrink-0 text-blue-400" />
          <span>{t('app.plan.free.features.storage')}</span>
        </li>
        <li className="flex items-start">
          <Sparkles className="mt-1 mr-3 h-5 w-5 flex-shrink-0 text-purple-400" />
          <span>{t('app.plan.free.features.ai')}</span>
        </li>
        <CommonFeatures />
        <li className="flex items-start">
          <Phone className="mt-1 mr-3 h-5 w-5 flex-shrink-0 text-indigo-400" />
          <span>{t('app.plan.free.features.ios')}</span>
        </li>
        <li className="flex items-start">
          <LifeBuoy className="mt-1 mr-3 h-5 w-5 flex-shrink-0 text-orange-400" />
          <span>{t('app.plan.free.features.support')}</span>
        </li>
      </ul>
      <div className="mt-8">{props.children}</div>
    </div>
  )
}

export default FreePlanFeatures
