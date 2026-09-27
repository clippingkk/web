'use client'

import { useRouter } from 'next/navigation'

import CommentItem from '@/components/comment/comment-item'
import type { GetCommentQuery } from '@/gql/graphql'
import { dashHref } from '@/utils/profile.utils'

type CommentDetailProps = {
  comment: GetCommentQuery['getComment']
  viewerId?: number | null
}

function CommentDetail({ comment, viewerId }: CommentDetailProps) {
  const router = useRouter()
  return (
    <CommentItem
      comment={comment}
      variant="with-context"
      viewerId={viewerId}
      onDeleted={() => router.replace(dashHref(comment.creator, 'comments'))}
    />
  )
}

export default CommentDetail
