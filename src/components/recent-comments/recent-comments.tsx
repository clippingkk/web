import React from 'react'
import { MessageCircle, ChevronRight } from 'lucide-react'
import { ProfileQuery } from '@/schema/generated'
import CommentItem from '@/components/comment-item/comment-item'
import Link from 'next/link'

type RecentCommentsProps = {
  commentList: ProfileQuery['me']['commentList']
  userId: number
  userDomain?: string | null
  showHeader?: boolean
  maxItems?: number
}

const RecentComments = ({ 
  commentList, 
  userId, 
  userDomain,
  showHeader = true, 
  maxItems = 5 
}: RecentCommentsProps) => {
  const { items, count } = commentList
  const displayItems = items.slice(0, maxItems)
  const hasMore = count > maxItems

  if (count === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white/70 via-white/60 to-white/40 p-6 shadow-xl backdrop-blur-lg dark:border-gray-700 dark:from-gray-900/70 dark:via-gray-800/60 dark:to-gray-900/40">
        {showHeader && (
          <div className="mb-4 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-medium text-gray-800 dark:text-gray-200">
              Recent Comments
            </h2>
          </div>
        )}
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <MessageCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
            No comments yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Start engaging with the community by commenting on clippings you find interesting.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white/70 via-white/60 to-white/40 p-6 shadow-xl backdrop-blur-lg dark:border-gray-700 dark:from-gray-900/70 dark:via-gray-800/60 dark:to-gray-900/40">
      {showHeader && (
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-medium text-gray-800 dark:text-gray-200">
              Recent Comments
            </h2>
            {count > 0 && (
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                {count}
              </span>
            )}
          </div>
          
          {hasMore && (
            <Link
              href={`/dash/${userDomain || userId}/comments`}
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
      
      <div className="space-y-4">
        {displayItems.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            showAvatar={true}
          />
        ))}
      </div>
      
      {hasMore && !showHeader && (
        <div className="mt-6 text-center">
          <Link
            href={`/dash/${userDomain || userId}/comments`}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
          >
            View all {count} comments
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  )
}

export default RecentComments