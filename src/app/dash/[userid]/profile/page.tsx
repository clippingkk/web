import Avatar from '@annatarhe/lake-ui/avatar'
import Badge from '@annatarhe/lake-ui/badge'
import { HydrationBoundary } from '@tanstack/react-query'
import { ChartColumn, Crown, LibraryBig, Rss } from 'lucide-react'
import type { Metadata, Route } from 'next'
import Link from 'next/link'
import type React from 'react'

import Page from '@/components/layout/page'
import Section from '@/components/layout/section'
import PersonalActivity from '@/components/profile/activity'
import { checkIsPremium } from '@/compute/user'
import { API_HOST } from '@/constants/config'
import {
  FetchClippingsByUidDocument,
  GetCommentListDocument,
  ProfilePageDocument,
} from '@/gql/graphql'
import { getTranslation } from '@/i18n'
import { pageMetadata } from '@/lib/metadata'
import { resolvePathUser } from '@/server/data/path-user'
import { serverQuery } from '@/server/data/query'
import { getViewer } from '@/server/data/viewer'
import { prefetchWenquBooks } from '@/server/data/wenqu'
import { formatDate } from '@/utils/format-date'
import { resolveMediaUrl } from '@/utils/image'
import { dashHref, getUserSlug, isUsableDomain } from '@/utils/profile.utils'

import FollowButton from './follow-button'
import OwnerAvatar from './owner-avatar'
import PersonalityView from './personality'
import ProfileEditor from './profile-editor'
import ProfileTabs from './profile-tabs'

const PAGE_SIZE = 20

type PageProps = {
  params: Promise<{ userid: string }>
  searchParams: Promise<{ with_profile_editor?: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { userid } = await props.params
  const [user, { t }] = await Promise.all([
    resolvePathUser(userid),
    getTranslation(undefined, 'profile'),
  ])
  return pageMetadata({
    title: t('meta.title', { name: user.name }),
    description:
      user.bio ||
      t('meta.description', { name: user.name, count: user.clippingsCount }),
    path: dashHref(user, 'profile'),
    image: user.avatar ? resolveMediaUrl(user.avatar) : null,
    type: 'profile',
  })
}

/** Aug–Dec shows this year's report; earlier months still show last year's. */
function reportYear(now = new Date()) {
  return now.getFullYear() - (now.getMonth() > 6 ? 0 : 1)
}

type LinkCardProps = {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  external?: boolean
}

function LinkCard({ href, icon, title, description, external }: LinkCardProps) {
  const className =
    'group rounded-lake-panel border-lake-line bg-lake-surface hover:border-lake-line-strong flex items-start gap-3 border p-4 transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-lake-ring'
  const body = (
    <>
      <span
        aria-hidden="true"
        className="text-lake-accent-text bg-lake-accent-soft rounded-lake-control shrink-0 p-2 [&_svg]:size-4"
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-lake-fg group-hover:text-lake-accent-text text-sm font-medium transition-colors duration-150">
          {title}
        </span>
        <span className="text-lake-fg-muted text-sm">{description}</span>
      </span>
    </>
  )
  return external ? (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {body}
    </a>
  ) : (
    <Link href={href as Route} className={className}>
      {body}
    </Link>
  )
}

async function ProfilePage(props: PageProps) {
  const [{ userid }, { with_profile_editor }] = await Promise.all([
    props.params,
    props.searchParams,
  ])
  const [pathUser, viewer, { t, i18n }] = await Promise.all([
    resolvePathUser(userid),
    getViewer(),
    getTranslation(undefined, 'profile'),
  ])
  const isOwner = viewer?.id === pathUser.id
  const [profile, clippings, comments] = await Promise.all([
    serverQuery(ProfilePageDocument, { id: pathUser.id }),
    serverQuery(FetchClippingsByUidDocument, {
      uid: pathUser.id,
      pagination: { limit: PAGE_SIZE },
    }),
    serverQuery(GetCommentListDocument, {
      uid: pathUser.id,
      pagination: { limit: PAGE_SIZE },
    }),
  ])
  const user = profile.me
  const prefetched = await prefetchWenquBooks(
    clippings.clippingList.items.map((c) => c.bookID)
  )
  const isPremium = checkIsPremium(user.premiumEndAt)
  const year = reportYear()
  const handle = isUsableDomain(user.domain) ? `@${user.domain}` : null

  const stats = [
    { label: t('stats.highlights'), value: user.clippingsCount },
    { label: t('stats.books'), value: user.booksCount },
    { label: t('stats.followers'), value: user.followers.length },
  ]

  return (
    <Page width="default">
      <header className="border-lake-line flex flex-col gap-6 border-b pb-8 sm:flex-row sm:items-center">
        {isOwner ? (
          <OwnerAvatar
            uid={user.id}
            name={user.name}
            avatar={user.avatar}
            isPremium={isPremium}
          />
        ) : (
          <Avatar
            src={user.avatar ? resolveMediaUrl(user.avatar) : null}
            name={user.name}
            size="xl"
            ring={isPremium ? 'premium' : 'none'}
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="type-title text-lake-fg">{user.name}</h1>
            {isPremium ? (
              <Badge
                tone="warning"
                variant="soft"
                size="sm"
                icon={<Crown className="size-3" aria-hidden="true" />}
              >
                {t('premium')}
              </Badge>
            ) : null}
          </div>
          <p className="type-meta flex flex-wrap gap-x-3">
            {handle ? <span>{handle}</span> : null}
            <span>
              {t('joined', {
                date: formatDate(user.createdAt, i18n.language, 'long'),
              })}
            </span>
          </p>
          <p className="text-lake-fg-muted max-w-2xl whitespace-pre-line">
            {user.bio || (isOwner ? t('noBio') : null)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:self-start">
          {isOwner ? (
            <>
              <ProfileEditor
                name={user.name}
                bio={user.bio}
                domain={user.domain}
                defaultOpen={with_profile_editor === '1'}
              />
              {isPremium ? <PersonalityView uid={user.id} /> : null}
            </>
          ) : (
            <FollowButton
              userId={user.id}
              isFan={user.isFan}
              signedIn={!!viewer}
            />
          )}
        </div>
      </header>

      <dl
        aria-label={t('stats.label')}
        className="border-lake-line divide-lake-line rounded-lake-panel grid grid-cols-3 divide-x border"
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-1 px-4 py-4 sm:px-6"
          >
            <dt className="type-meta">{stat.label}</dt>
            <dd className="font-reading text-lake-fg text-2xl font-semibold tabular-nums">
              {stat.value.toLocaleString(i18n.language)}
            </dd>
          </div>
        ))}
      </dl>

      <Section
        id="activity"
        variant="card"
        title={t('activity.title')}
        description={t('activity.description')}
      >
        <div className="no-scrollbar overflow-x-auto">
          <PersonalActivity data={user.analysis.daily} />
        </div>
      </Section>

      <Section id="more" title={t('links.title', { name: user.name })}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <LinkCard
            href={`/report/yearly?uid=${user.id}&year=${year}`}
            icon={<ChartColumn />}
            title={t('links.yearly', { year })}
            description={t('links.yearlyDescription')}
          />
          {isOwner ? (
            <LinkCard
              href="/report/favourites"
              icon={<LibraryBig />}
              title={t('links.favourites')}
              description={t('links.favouritesDescription')}
            />
          ) : null}
          <LinkCard
            external
            href={`${API_HOST}/api/rss/user/${user.id}/clippings`}
            icon={<Rss />}
            title={t('links.rss')}
            description={t('links.rssDescription')}
          />
        </div>
      </Section>

      <HydrationBoundary state={prefetched.state}>
        <ProfileTabs
          uid={user.id}
          slug={getUserSlug(user)}
          isOwner={isOwner}
          viewerId={viewer?.id}
          pageSize={PAGE_SIZE}
          initialClippings={clippings.clippingList.items}
          clippingsCount={clippings.clippingList.count}
          initialComments={comments.getCommentList.items}
          commentsCount={comments.getCommentList.count}
        />
      </HydrationBoundary>
    </Page>
  )
}

export default ProfilePage
