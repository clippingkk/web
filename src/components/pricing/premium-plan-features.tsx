import {
  Check,
  HardDrive,
  LifeBuoy,
  Phone,
  Rss,
  Sparkles,
  Zap,
} from 'lucide-react'
import type React from 'react'

import { getTranslation } from '@/i18n'

import CommonFeatures from './common-features'
import DeveloperFeatures from './developer-features'

type PremiumPlanFeaturesProps = {
  children?: React.ReactNode
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _FeatureItem({
  children,
  highlight = false,
}: {
  children: React.ReactNode
  highlight?: boolean
}) {
  return (
    <li className="flex items-start">
      {highlight ? (
        <Zap className="mt-1 mr-3 h-5 w-5 flex-shrink-0 text-amber-400" />
      ) : (
        <Check className="mt-1 mr-3 h-5 w-5 flex-shrink-0 text-emerald-400" />
      )}
      <span>{children}</span>
      {highlight && (
        <span className="ml-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-2 py-0.5 text-xs font-medium text-white">
          Premium
        </span>
      )}
    </li>
  )
}

async function PremiumPlanFeatures(props: PremiumPlanFeaturesProps) {
  const { t } = await getTranslation()
  return (
    <div className="space-y-6">
      <ul className="space-y-4 text-lg">
        <li className="flex items-start">
          <HardDrive className="mt-1 mr-3 h-5 w-5 flex-shrink-0 text-cyan-400" />
          <span className="font-medium">
            {t('app.plan.premium.features.storage')}
          </span>
          <span className="ml-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-2 py-0.5 text-xs font-medium text-white">
            Unlimited
          </span>
        </li>
        <li className="flex items-start">
          <Sparkles className="mt-1 mr-3 h-5 w-5 flex-shrink-0 text-fuchsia-400" />
          <span className="font-medium">
            {t('app.plan.premium.features.ai')}
          </span>
        </li>
        <li className="flex items-start">
          <Phone className="mt-1 mr-3 h-5 w-5 flex-shrink-0 text-violet-400" />
          <span className="font-medium">
            {t('app.plan.premium.features.ios')}
          </span>
        </li>
        <CommonFeatures />
        <DeveloperFeatures />
        <li className="flex items-start">
          <Rss className="mt-1 mr-3 h-5 w-5 flex-shrink-0 text-amber-400" />
          <span className="font-medium">
            {t('app.plan.premium.features.rss')}
          </span>
        </li>
        <li className="flex items-start">
          <LifeBuoy className="mt-1 mr-3 h-5 w-5 flex-shrink-0 text-pink-400" />
          <span className="font-medium">
            {t('app.plan.premium.features.support')}
          </span>
          <span className="ml-2 rounded-full bg-gradient-to-r from-green-500 to-lime-500 px-2 py-0.5 text-xs font-medium text-white">
            Priority
          </span>
        </li>
      </ul>
      <div className="mt-8">{props.children}</div>
    </div>
  )
}

export default PremiumPlanFeatures
