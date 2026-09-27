import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import Page from '@/components/layout/page'
import PageHeader from '@/components/layout/page-header'
import { GetCommentDocument } from '@/gql/graphql'
import { getTranslation } from '@/i18n'
import { pageMetadata } from '@/lib/metadata'
import { serverQuery } from '@/server/data/query'
import { getViewer } from '@/server/data/viewer'
import { dashHref } from '@/utils/profile.utils'

import CommentDetail from './comment-detail'

type Props = {
  params: Promise<{ userid: string; commentid: string }>
}

function parseId(value: string) {
  return /^\d+$/.test(value) ? Number(value) : null
}

async function loadComment(commentid: string) {
  const id = parseId(commentid)
  if (!id) notFound()
  // The server hides comments on clippings the viewer can't see.
  const { getComment } = await serverQuery(GetCommentDocument, { id })
  return getComment
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { commentid } = await params
  const [comment, { t }] = await Promise.all([
    loadComment(commentid),
    getTranslation(undefined, 'reading'),
  ])
  return pageMetadata({
    title: t('commentPage.metaTitle', { name: comment.creator.name }),
    description: comment.content.slice(0, 160),
    type: 'article',
  })
}

export default async function CommentPage({ params }: Props) {
  const { commentid } = await params
  const [comment, viewer, { t }] = await Promise.all([
    loadComment(commentid),
    getViewer(),
    getTranslation(undefined, 'reading'),
  ])

  return (
    <Page width="reading">
      <PageHeader
        back={{
          href: dashHref(comment.creator, 'comments'),
          label: t('commentPage.back'),
        }}
        title={t('commentPage.title')}
      />
      <CommentDetail comment={comment} viewerId={viewer?.id} />
    </Page>
  )
}
