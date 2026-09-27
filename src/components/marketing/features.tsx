import { BookOpenText, Share2, Upload } from 'lucide-react'

import { getTranslation } from '@/i18n'

import MarketingSection from './marketing-section'

const FEATURES = [
  { key: 'import', icon: Upload },
  { key: 'library', icon: BookOpenText },
  { key: 'share', icon: Share2 },
] as const

async function Features() {
  const { t } = await getTranslation(undefined, 'marketing')
  return (
    <MarketingSection
      id="features"
      eyebrow={t('features.eyebrow')}
      title={t('features.title')}
    >
      <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
        {FEATURES.map(({ key, icon: Icon }, index) => (
          <li key={key} className="flex flex-col gap-3">
            <div className="text-lake-fg-subtle flex items-center gap-3">
              <span className="font-reading text-sm tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span aria-hidden="true" className="bg-lake-line h-px flex-1" />
              <Icon className="size-4" aria-hidden="true" />
            </div>
            <h3 className="type-heading text-lake-fg">
              {t(`features.${key}.title`)}
            </h3>
            <p className="type-body text-lake-fg-muted">
              {t(`features.${key}.body`)}
            </p>
          </li>
        ))}
      </ol>
    </MarketingSection>
  )
}

export default Features
