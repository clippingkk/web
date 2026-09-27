'use client'

import Button from '@annatarhe/lake-ui/button'
import EmptyState from '@annatarhe/lake-ui/empty-state'
import Tabs, { TabPanel } from '@annatarhe/lake-ui/tabs'
import { useApolloClient } from '@apollo/client/react'
import { Quote } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useState } from 'react'

import ClippingCard from '@/components/clipping/clipping-card'
import type { CommentItemData } from '@/components/comment/comment-item'
import CommentList from '@/components/comment/comment-list'
import LoadMoreFooter from '@/components/list/load-more-footer'
import MasonryGrid from '@/components/list/masonry-grid'
import {
  FetchClippingsByUidDocument,
  type FetchClippingsByUidQuery,
} from '@/gql/graphql'
import { useMultipleBook } from '@/hooks/book'
import { useTranslation } from '@/i18n/client'
import { IN_APP_CHANNEL } from '@/services/channel'
import { clippingHref, dashHref } from '@/utils/profile.utils'

type ProfileClipping = FetchClippingsByUidQuery['clippingList']['items'][number]

type ProfileTabsProps = {
  uid: number
  slug: string
  isOwner: boolean
  viewerId?: number | null
  pageSize: number
  initialClippings: ProfileClipping[]
  clippingsCount: number
  initialComments: CommentItemData[]
  commentsCount: number
}

function ProfileTabs(props: ProfileTabsProps) {
  const {
    uid,
    slug,
    isOwner,
    viewerId,
    pageSize,
    initialClippings,
    clippingsCount,
    initialComments,
    commentsCount,
  } = props
  const { t } = useTranslation(undefined, 'profile')
  const client = useApolloClient()
  const [tab, setTab] = useState<'clippings' | 'comments'>('clippings')
  const [items, setItems] = useState(initialClippings)
  const [loading, setLoading] = useState(false)
  const { books } = useMultipleBook(items.map((c) => c.bookID))
  const titleById = new Map(books.map((b) => [String(b.doubanId), b.title]))

  const loadMore = useCallback(async () => {
    const lastId = items.at(-1)?.id
    if (!lastId || loading) return
    setLoading(true)
    try {
      const { data } = await client.query({
        query: FetchClippingsByUidDocument,
        variables: { uid, pagination: { limit: pageSize, lastId } },
        fetchPolicy: 'network-only',
      })
      const next = data?.clippingList.items ?? []
      setItems((current) => {
        const seen = new Set(current.map((c) => c.id))
        return [...current, ...next.filter((c) => !seen.has(c.id))]
      })
    } finally {
      setLoading(false)
    }
  }, [client, uid, pageSize, items, loading])

  return (
    <div className="flex flex-col gap-6">
      <Tabs
        aria-label={t('tabs.label')}
        idBase="profile"
        value={tab}
        onValueChange={setTab}
        items={[
          {
            value: 'clippings',
            label: t('tabs.clippings'),
            count: clippingsCount,
          },
          {
            value: 'comments',
            label: t('tabs.comments'),
            count: commentsCount,
          },
        ]}
      />
      <TabPanel idBase="profile" value="clippings" activeValue={tab}>
        {isOwner ? (
          <p className="type-meta mb-4">{t('clippings.ownerNote')}</p>
        ) : null}
        {items.length > 0 ? (
          <>
            <MasonryGrid
              items={items}
              getKey={(c) => c.id}
              estimateHeight={(c) => 140 + Math.min(c.content.length, 600)}
              renderItem={(c) => (
                <ClippingCard
                  clipping={c}
                  bookTitle={titleById.get(c.bookID)}
                  href={clippingHref(
                    slug,
                    c.id,
                    IN_APP_CHANNEL.clippingFromUser
                  )}
                />
              )}
            />
            <LoadMoreFooter
              hasMore={items.length < clippingsCount}
              loading={loading}
              onLoadMore={loadMore}
              showEnd={clippingsCount > pageSize}
            />
          </>
        ) : (
          <EmptyState
            icon={<Quote className="size-6" />}
            title={t('clippings.emptyTitle')}
            description={t('clippings.emptyDescription')}
          />
        )}
      </TabPanel>
      <TabPanel idBase="profile" value="comments" activeValue={tab}>
        <CommentList
          uid={uid}
          initialItems={initialComments}
          initialCount={commentsCount}
          pageSize={pageSize}
          viewerId={viewerId}
          emptyTitle={t('comments.emptyTitle')}
          emptyDescription={t('comments.emptyDescription')}
        />
        {commentsCount > initialComments.length ? (
          <Button
            variant="ghost"
            size="sm"
            className="mt-4"
            render={<Link href={dashHref(slug, 'comments')} />}
          >
            {t('comments.viewAll')}
          </Button>
        ) : null}
      </TabPanel>
    </div>
  )
}

export default ProfileTabs
