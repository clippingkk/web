import Avatar from '@annatarhe/lake-ui/avatar'
import Button from '@annatarhe/lake-ui/button'
import { ArrowRight } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'

import { splitClippingLines } from '@/components/clipping/clipping-text'
import { getTranslation } from '@/i18n'
import { cn } from '@/lib/utils'
import { resolveMediaUrl } from '@/utils/image'

import type { HeroClipping } from './landing-data'

export type HeroQuote = {
  clipping: HeroClipping
  /** Wenqu title when known, else the Kindle title. */
  bookTitle?: string | null
  href: Route
}

type HeroProps = {
  /** The reader's library when signed in, sign-in otherwise. */
  startHref: Route
  signedIn: boolean
  /** A real highlight for the card; null shows the sample passage. */
  quote: HeroQuote | null
}

type Translate = Awaited<ReturnType<typeof getTranslation>>['t']

const cardClassName =
  'rounded-lake-panel border-lake-line bg-lake-surface shadow-lake-card flex flex-col gap-6 border p-6 sm:p-8'

function ClippingQuote({ quote, t }: { quote: HeroQuote; t: Translate }) {
  const { clipping, bookTitle, href } = quote
  const { creator } = clipping
  return (
    <Link
      href={href}
      className="group rounded-lake-panel focus-visible:ring-lake-ring focus-visible:ring-offset-lake-canvas block outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      <figure
        className={cn(
          cardClassName,
          'group-hover:border-lake-line-strong transition-colors duration-150 motion-reduce:transition-none'
        )}
      >
        <figcaption className="type-eyebrow">
          {clipping.own
            ? t('hero.quote.own')
            : t('hero.quote.public', { name: creator.name })}
        </figcaption>
        <blockquote className="type-quote-lg text-lake-fg line-clamp-[7] whitespace-pre-line">
          <p>
            <mark className="marker">
              {splitClippingLines(clipping.content).join('\n')}
            </mark>
          </p>
        </blockquote>
        <div className="border-lake-line flex items-center justify-between gap-4 border-t pt-4">
          <p className="font-reading text-lake-fg-muted min-w-0 truncate italic">
            {bookTitle}
          </p>
          <span className="type-meta flex shrink-0 items-center gap-2">
            <Avatar
              src={creator.avatar ? resolveMediaUrl(creator.avatar) : null}
              name={creator.name}
              size="xs"
            />
            <span className="max-w-40 truncate">{creator.name}</span>
          </span>
        </div>
      </figure>
    </Link>
  )
}

/** The sample passage, for when no real highlight is available. */
function SpecimenQuote({ t }: { t: Translate }) {
  return (
    <figure className={cardClassName}>
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
  )
}

async function Hero({ startHref, signedIn, quote }: HeroProps) {
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
          <Button
            size="lg"
            variant="secondary"
            render={<Link href="/pricing" />}
          >
            {t('hero.pricing')}
          </Button>
        </div>
        {signedIn ? null : <p className="type-meta">{t('hero.note')}</p>}
      </div>

      {quote ? <ClippingQuote quote={quote} t={t} /> : <SpecimenQuote t={t} />}
    </section>
  )
}

export default Hero
