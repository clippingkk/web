import EmptyState from '@annatarhe/lake-ui/empty-state'
import { Quote } from 'lucide-react'

import ClippingCard from '@/components/clipping/clipping-card'
import { getTranslation } from '@/i18n'
import { IN_APP_CHANNEL } from '@/services/channel'
import { clippingHref } from '@/utils/profile.utils'

import type { PublicClipping } from './landing-data'
import MarketingSection from './marketing-section'

type FeaturedClippingsProps = {
  clippings: PublicClipping[]
  /** Wenqu titles by Douban id; the Kindle title is the fallback. */
  bookTitles: ReadonlyMap<string, string>
}

async function FeaturedClippings({
  clippings,
  bookTitles,
}: FeaturedClippingsProps) {
  const { t } = await getTranslation(undefined, 'marketing')
  return (
    <MarketingSection
      id="today"
      eyebrow={t('clippings.eyebrow')}
      title={t('clippings.title')}
      description={t('clippings.description')}
    >
      {clippings.length > 0 ? (
        <ul className="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {clippings.map((c) => (
            <li key={c.id}>
              <ClippingCard
                variant="feature"
                clipping={c}
                bookTitle={bookTitles.get(c.bookID)}
                creator={c.creator}
                href={clippingHref(
                  c.creator,
                  c.id,
                  IN_APP_CHANNEL.clippingFromUser
                )}
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          size="sm"
          icon={<Quote className="size-6" />}
          title={t('clippings.empty.title')}
          description={t('clippings.empty.description')}
        />
      )}
    </MarketingSection>
  )
}

export default FeaturedClippings
