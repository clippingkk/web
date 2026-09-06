import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { GetCommentDocument, type GetCommentQuery } from '@/gql/graphql'
import { currentUserId } from '@/server/gate/current'
import { doApolloServerQuery } from '@/services/apollo.server'

import CommentDetail from './comment-detail'

type Props = {
  params: Promise<{
    userid: string
    commentid: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { commentid } = await params
  const id = parseInt(commentid, 10)

  if (Number.isNaN(id)) {
    return { title: 'Comment Not Found' }
  }

  const { data } = await doApolloServerQuery<GetCommentQuery>({
    query: GetCommentDocument,
    variables: { id },
    context: {
      headers: {},
    },
  })

  if (!data?.getComment) {
    return { title: 'Comment Not Found' }
  }

  const comment = data.getComment
  const truncatedContent =
    comment.content.length > 160
      ? `${comment.content.substring(0, 160)}...`
      : comment.content

  return {
    title: `Comment by ${comment.creator.name} on "${comment.belongsTo.title}"`,
    description: truncatedContent,
    openGraph: {
      title: `Comment by ${comment.creator.name}`,
      description: truncatedContent,
      type: 'article',
      publishedTime: comment.createdAt,
      modifiedTime: comment.updatedAt,
      authors: [comment.creator.name],
    },
  }
}

async function CommentPage({ params }: Props) {
  const { commentid } = await params

  const uid = parseInt((await currentUserId())?.toString() || '0', 10)
  const id = parseInt(commentid, 10)

  if (Number.isNaN(uid) || uid <= 0 || Number.isNaN(id)) {
    notFound()
  }

  const { data } = await doApolloServerQuery<GetCommentQuery>({
    query: GetCommentDocument,
    variables: { id },
    context: {
      headers: {},
    },
  })

  if (!data?.getComment) {
    notFound()
  }

  const comment = data.getComment

  // Check if the comment belongs to the user
  if (comment.creator.id !== uid) {
    notFound()
  }

  return <CommentDetail comment={comment} />
}

export default CommentPage
