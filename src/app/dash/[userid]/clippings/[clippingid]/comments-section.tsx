import CommentThread from '@/components/comment/comment-thread'
import { GetCommentListDocument } from '@/gql/graphql'
import { serverQuery } from '@/server/data/query'
import type { Viewer } from '@/server/data/viewer'

const PAGE_SIZE = 20

type CommentsSectionProps = {
  clippingId: number
  bookTitle?: string | null
  viewer: Viewer | null
}

async function CommentsSection(props: CommentsSectionProps) {
  const { clippingId, bookTitle, viewer } = props
  const data = await serverQuery(GetCommentListDocument, {
    cid: clippingId,
    pagination: { limit: PAGE_SIZE },
  })
  return (
    <CommentThread
      clippingId={clippingId}
      bookTitle={bookTitle}
      initialItems={data.getCommentList.items}
      initialCount={data.getCommentList.count}
      pageSize={PAGE_SIZE}
      viewer={
        viewer
          ? {
              id: viewer.id,
              name: viewer.name,
              avatar: viewer.avatar,
              isPremium: viewer.isPremium,
            }
          : null
      }
    />
  )
}

export default CommentsSection
