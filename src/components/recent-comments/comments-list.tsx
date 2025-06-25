import React from 'react'
import { ProfileQuery } from '@/schema/generated'
import CommentItem from '@/components/comment-item/comment-item'

type CommentsListProps = {
  items: ProfileQuery['me']['commentList']['items']
  maxItems?: number
}

export default function CommentsList({ items, maxItems = 5 }: CommentsListProps) {
  const displayItems = items.slice(0, maxItems)

  return (
    <div className="space-y-6">
      {displayItems.map((comment, index) => (
        <div
          key={comment.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CommentItem
            comment={comment}
            showAvatar={true}
          />
        </div>
      ))}
    </div>
  )
}