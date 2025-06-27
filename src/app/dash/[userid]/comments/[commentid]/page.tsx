import { GetCommentDocument, GetCommentQuery } from '@/schema/generated'
import { notFound } from 'next/navigation'
import CommentDetail from './comment-detail'
import type { Metadata } from 'next'
import { doApolloServerQuery } from '@/services/apollo.server'
import { cookies } from 'next/headers'
import { USER_ID_KEY, COOKIE_TOKEN_KEY } from '@/constants/storage'

type Props = {
  params: Promise<{
    userid: string
    commentid: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { commentid } = await params
  const id = parseInt(commentid, 10)
  
  if (isNaN(id)) {
    return { title: 'Comment Not Found' }
  }

  const ck = await cookies()
  const token = ck.get(COOKIE_TOKEN_KEY)?.value

  const { data } = await doApolloServerQuery<GetCommentQuery>({
    query: GetCommentDocument,
    variables: { id },
    context: {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    }
  })

  if (!data?.getComment) {
    return { title: 'Comment Not Found' }
  }

  const comment = data.getComment
  const truncatedContent = comment.content.length > 160 
    ? comment.content.substring(0, 160) + '...' 
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
      authors: [comment.creator.name]
    }
  }
}

async function CommentPage({ params }: Props) {
  const { commentid } = await params

  const ck = await cookies()

  const uid = parseInt(ck.get(USER_ID_KEY)?.value || '0', 10)
  const id = parseInt(commentid, 10)
  
  if (isNaN(uid) || uid <= 0 || isNaN(id)) {
    notFound()
  }

  const token = ck.get(COOKIE_TOKEN_KEY)?.value
  
  const { data, error } = await doApolloServerQuery<GetCommentQuery>({
    query: GetCommentDocument,
    variables: { id },
    context: {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    }
  })

  if (error || !data?.getComment) {
    notFound()
  }

  const comment = data.getComment

  // Check if the comment belongs to the user
  if (comment.creator.id !== uid) {
    notFound()
  }

  return (
    <CommentDetail comment={comment} />
  )
}

export default CommentPage
