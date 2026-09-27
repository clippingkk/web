import Button from '@annatarhe/lake-ui/button'
import type { Route } from 'next'
import Link from 'next/link'

import { getTranslation } from '@/i18n'

type ClosingCtaProps = {
  startHref: Route
  signedIn: boolean
}

async function ClosingCta({ startHref, signedIn }: ClosingCtaProps) {
  const { t } = await getTranslation(undefined, 'marketing')
  return (
    <section
      aria-labelledby="closing-title"
      className="rounded-lake-panel border-lake-line bg-lake-surface flex flex-col items-start gap-6 border px-6 py-10 sm:px-10 md:flex-row md:items-center md:justify-between md:py-12"
    >
      <div className="flex max-w-xl flex-col gap-2">
        <h2 id="closing-title" className="type-title text-lake-fg">
          {t('cta.title')}
        </h2>
        <p className="type-body text-lake-fg-muted">{t('cta.description')}</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-3">
        <Button variant="primary" render={<Link href={startHref} />}>
          {signedIn ? t('cta.open') : t('cta.start')}
        </Button>
        <Button variant="secondary" render={<Link href="/pricing" />}>
          {t('cta.pricing')}
        </Button>
      </div>
    </section>
  )
}

export default ClosingCta
