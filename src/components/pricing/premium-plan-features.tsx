import { Badge } from '@mantine/core'
import React from 'react'
import { useTranslation } from '@/i18n'
import CommonFeatures from './common-features'
import DeveloperFeatures from './developer-features'
import { HardDrive, Sparkles, Phone, LifeBuoy, Rss, Check, Zap } from 'lucide-react'

type PremiumPlanFeaturesProps = {
  children?: React.ReactNode
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function FeatureItem({ children, highlight = false }: { children: React.ReactNode, highlight?: boolean }) {
  return (
    <li className='flex items-start'>
      {highlight ? (
        <Zap className="h-5 w-5 mr-3 text-amber-400 mt-1 flex-shrink-0" />
      ) : (
        <Check className="h-5 w-5 mr-3 text-emerald-400 mt-1 flex-shrink-0" />
      )}
      <span>{children}</span>
      {highlight && (
        <Badge size="xs" variant="gradient" className="ml-2" gradient={{ from: 'indigo', to: 'cyan' }}>
          Premium
        </Badge>
      )}
    </li>
  )
}

async function PremiumPlanFeatures(props: PremiumPlanFeaturesProps) {
  const { t } = await useTranslation()
  return (
    <div className="space-y-6">
      <ul className='text-lg space-y-4'>
        <li className='flex items-start'>
          <HardDrive className="h-5 w-5 mr-3 text-cyan-400 mt-1 flex-shrink-0" />
          <span className="font-medium">{t('app.plan.premium.features.storage')}</span>
          <Badge size="xs" variant="gradient" className="ml-2" gradient={{ from: 'orange', to: 'red' }}>
            Unlimited
          </Badge>
        </li>
        <li className='flex items-start'>
          <Sparkles className="h-5 w-5 mr-3 text-fuchsia-400 mt-1 flex-shrink-0" />
          <span className="font-medium">{t('app.plan.premium.features.ai')}</span>
        </li>
        <li className='flex items-start'>
          <Phone className="h-5 w-5 mr-3 text-violet-400 mt-1 flex-shrink-0" />
          <span className="font-medium">{t('app.plan.premium.features.ios')}</span>
        </li>
        <CommonFeatures />
        <DeveloperFeatures />
        <li className='flex items-start'>
          <Rss className="h-5 w-5 mr-3 text-amber-400 mt-1 flex-shrink-0" />
          <span className="font-medium">{t('app.plan.premium.features.rss')}</span>
        </li>
        <li className='flex items-start'>
          <LifeBuoy className="h-5 w-5 mr-3 text-pink-400 mt-1 flex-shrink-0" />
          <span className="font-medium">{t('app.plan.premium.features.support')}</span>
          <Badge size="xs" variant="gradient" className="ml-2" gradient={{ from: 'green', to: 'lime' }}>
            Priority
          </Badge>
        </li>
      </ul>
      <div className="mt-8">
        {props.children}
      </div>
    </div>
  )
}

export default PremiumPlanFeatures
