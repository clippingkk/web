import type { Metadata } from 'next'

import CommentList from '@/components/comment/comment-list'
import Page from '@/components/layout/page'
import PageHeader from '@/components/layout/page-header'
import { GetCommentListDocument } from '@/gql/graphql'
import { getTranslation } from '@/i18n'
import { pageMetadata } from '@/lib/metadata'
import { resolvePathUser } from '@/server/data/path-user'
import { serverQuery } from '@/server/data/query'
import { getViewer } from '@/server/data/viewer'
import { dashHref } from '@/utils/profile.utils'

const PAGE_SIZE = 20

type Props = {
  params: Promise<{ userid: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userid } = await params
  const [user, { t }] = await Promise.all([
    resolvePathUser(userid),
    getTranslation(undefined, 'reading'),
  ])
  return pageMetadata({
    title: t('commentsPage.metaTitle', { name: user.name }),
    path: dashHref(user, 'comments'),
  })
}

export default async function CommentsPage({ params }: Props) {
  const { userid } = await params
  const [user, viewer, { t }] = await Promise.all([
    resolvePathUser(userid),
    getViewer(),
    getTranslation(undefined, 'reading'),
  ])
  const data = await serverQuery(GetCommentListDocument, {
    uid: user.id,
    pagination: { limit: PAGE_SIZE },
  })
  const isOwner = viewer?.id === user.id

  return (
    <Page width="reading">
      <PageHeader
        back={{
          href: dashHref(user, 'profile'),
          label: t('commentsPage.back'),
        }}
        title={
          isOwner
            ? t('commentsPage.ownerTitle')
            : t('commentsPage.visitorTitle', { name: user.name })
        }
        description={t('commentsPage.description')}
        meta={
          <span>
            {t('comments.count', { count: data.getCommentList.count })}
          </span>
        }
      />
      <CommentList
        uid={user.id}
        initialItems={data.getCommentList.items}
        initialCount={data.getCommentList.count}
        pageSize={PAGE_SIZE}
        viewerId={viewer?.id}
        emptyTitle={t('commentsPage.emptyTitle')}
        emptyDescription={t('commentsPage.emptyDescription')}
      />
    </Page>
  )
}
