import Button from '@annatarhe/lake-ui/button'
import { ArrowRight } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'

import { getTranslation } from '@/i18n'

type HeroProps = {
  /** The reader's library when signed in, sign-in otherwise. */
  startHref: Route
  signedIn: boolean
}

async function Hero({ startHref, signedIn }: HeroProps) {
  const { t } = await getTranslation(undefined, 'marketing')
  return (
    <section
      aria-labelledby="hero-title"
      className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-20"
    >
      <div className="flex flex-col gap-6">
        <p className="type-eyebrow">{t('hero.eyebrow')}</p>
        <h1 id="hero-title" className="type-display text-lake-fg max-w-xl">
          {t('hero.title')}
        </h1>
        <p className="text-lake-fg-muted max-w-lg text-lg leading-relaxed">
          {t('hero.description')}
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            size="lg"
            variant="primary"
            trailingIcon={<ArrowRight className="size-4" />}
            render={<Link href={startHref} />}
          >
            {signedIn ? t('hero.open') : t('hero.start')}
          </Button>
          <Button size="lg" variant="ghost" render={<Link href="/pricing" />}>
            {t('hero.pricing')}
          </Button>
        </div>
        {signedIn ? null : <p className="type-meta">{t('hero.note')}</p>}
      </div>

      <figure className="rounded-lake-panel border-lake-line bg-lake-surface shadow-lake-card flex flex-col gap-6 border p-6 sm:p-8">
        <figcaption className="type-eyebrow">{t('specimen.label')}</figcaption>
        <blockquote className="type-quote-lg text-lake-fg">
          <p>
            <mark className="marker">{t('specimen.highlight')}</mark>
            {t('specimen.rest')}
          </p>
        </blockquote>
        <div className="border-lake-line flex items-baseline justify-between gap-4 border-t pt-4">
          <p className="font-reading text-lake-fg-muted italic">
            {t('specimen.book')}
          </p>
          <p className="type-meta">{t('specimen.author')}</p>
        </div>
      </figure>
    </section>
  )
}

export default Hero
