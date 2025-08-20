import React from 'react'
import type { ProfileQuery } from '@/schema/generated'
import CommentsList from './comments-list'
import EmptyCommentsState from './empty-comments-state'
import RecentCommentsHeader from './recent-comments-header'
import ViewAllButton from './view-all-button'

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
  maxItems = 5,
}: RecentCommentsProps) => {
  const { items, count } = commentList
  const hasMore = count > maxItems

  if (count === 0) {
    return (
      <div className="rounded-3xl border border-white/40 dark:border-gray-700/40 bg-gradient-to-br from-white/80 via-white/70 to-white/60 dark:from-gray-900/80 dark:via-gray-800/70 dark:to-gray-900/60 p-8 shadow-lg backdrop-blur-xl">
        <EmptyCommentsState showHeader={showHeader} />
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-white/40 dark:border-gray-700/40 bg-gradient-to-br from-white/80 via-white/70 to-white/60 dark:from-gray-900/80 dark:via-gray-800/70 dark:to-gray-900/60 p-8 shadow-lg backdrop-blur-xl">
      {showHeader && (
        <RecentCommentsHeader
          count={count}
          userId={userId}
          userDomain={userDomain}
        />
      )}

      <CommentsList items={items} maxItems={maxItems} />

      {hasMore && !showHeader && (
        <ViewAllButton count={count} userId={userId} userDomain={userDomain} />
      )}
    </div>
  )
}

export default RecentComments
