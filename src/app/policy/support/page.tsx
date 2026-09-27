import { buttonStyles } from '@annatarhe/lake-ui/button'
import { ArrowRight, Mail } from 'lucide-react'
import type { Metadata, Route } from 'next'
import Link from 'next/link'

import Page from '@/components/layout/page'
import PageHeader from '@/components/layout/page-header'
import Section from '@/components/layout/section'
import { SUPPORT_EMAIL } from '@/constants/config'
import { getTranslation } from '@/i18n'
import { pageMetadata } from '@/lib/metadata'
import { cn } from '@/lib/utils'
import { getViewer } from '@/server/data/viewer'
import { dashHref } from '@/utils/profile.utils'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation(undefined, 'policy')
  return pageMetadata({
    title: t('support.meta.title'),
    description: t('support.meta.description'),
    path: '/policy/support',
  })
}

type Topic = {
  key: 'import' | 'account' | 'billing' | 'privacy'
  link?: { href: Route; label: string }
}

async function PolicySupportPage() {
  const [viewer, { t }] = await Promise.all([
    getViewer(),
    getTranslation(undefined, 'policy'),
  ])

  const topics: Topic[] = [
    {
      key: 'import',
      link: viewer
        ? {
            href: dashHref(viewer, 'upload'),
            label: t('support.topics.import.action'),
          }
        : undefined,
    },
    { key: 'account' },
    {
      key: 'billing',
      link: { href: '/pricing', label: t('support.topics.billing.action') },
    },
    {
      key: 'privacy',
      link: {
        href: '/policy/privacy',
        label: t('support.topics.privacy.action'),
      },
    },
  ]

  return (
    <Page width="reading">
      <PageHeader
        eyebrow={t('support.eyebrow')}
        title={t('support.title')}
        description={t('support.description')}
      />

      <Section
        id="email"
        variant="card"
        title={t('support.email.title')}
        description={t('support.email.body')}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lake-fg font-mono text-sm break-all select-all">
            {SUPPORT_EMAIL}
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className={cn(
              buttonStyles({ variant: 'primary', size: 'md' }),
              'w-fit shrink-0'
            )}
          >
            <Mail aria-hidden="true" className="size-4" />
            {t('support.email.action')}
          </a>
        </div>
      </Section>

      <Section id="topics" title={t('support.topics.title')}>
        <dl className="border-lake-line divide-lake-line divide-y border-y">
          {topics.map(({ key, link }) => (
            <div
              key={key}
              className="grid gap-2 py-5 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-6"
            >
              <dt className="font-reading text-lake-fg font-semibold">
                {t(`support.topics.${key}.title`)}
              </dt>
              <dd className="flex flex-col items-start gap-2">
                <p className="type-body text-lake-fg-muted">
                  {t(`support.topics.${key}.body`)}
                </p>
                {link ? (
                  <Link
                    href={link.href}
                    className="text-lake-accent-text focus-visible:ring-lake-ring inline-flex items-center gap-1 rounded-sm text-sm font-medium outline-none hover:underline focus-visible:ring-2"
                  >
                    {link.label}
                    <ArrowRight aria-hidden="true" className="size-3.5" />
                  </Link>
                ) : null}
              </dd>
            </div>
          ))}
        </dl>
      </Section>
    </Page>
  )
}

export default PolicySupportPage
