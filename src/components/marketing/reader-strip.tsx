import UserChip from '@/components/user/user-chip'
import { checkIsPremium } from '@/compute/user'
import { getTranslation } from '@/i18n'
import { dashHref } from '@/utils/profile.utils'

import type { PublicReader } from './landing-data'
import MarketingSection from './marketing-section'

type ReaderStripProps = {
  readers: PublicReader[]
}

async function ReaderStrip({ readers }: ReaderStripProps) {
  if (readers.length === 0) return null
  const { t } = await getTranslation(undefined, 'marketing')
  return (
    <MarketingSection
      id="readers"
      eyebrow={t('readers.eyebrow')}
      title={t('readers.title')}
      description={t('readers.description')}
    >
      <ul className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
        {readers.map((reader) => (
          <li key={reader.id} className="min-w-0">
            <UserChip
              href={dashHref(reader, 'profile')}
              name={reader.name}
              avatar={reader.avatar}
              isPremium={checkIsPremium(reader.premiumEndAt)}
              className="max-w-full"
            />
          </li>
        ))}
      </ul>
    </MarketingSection>
  )
}

export default ReaderStrip
