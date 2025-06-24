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
      <div className="relative group">
        {/* Background glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-gray-300/20 via-blue-300/20 to-purple-300/20 rounded-3xl blur opacity-50"></div>
        
        <div className="relative rounded-3xl border border-white/40 dark:border-gray-700/40 bg-gradient-to-br from-white/80 via-white/70 to-white/60 dark:from-gray-900/80 dark:via-gray-800/70 dark:to-gray-900/60 p-8 shadow-2xl backdrop-blur-xl">
          {showHeader && (
            <div className="mb-6 flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 bg-blue-400/30 rounded-full blur"></div>
                <MessageCircle className="relative h-6 w-6 text-blue-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Recent Comments
              </h2>
            </div>
          )}
          
          <div className="flex flex-col items-center justify-center py-16 text-center">
            {/* Enhanced empty state icon */}
            <div className="relative mb-6">
              <div className="absolute -inset-4 bg-gradient-to-r from-gray-200/50 to-blue-200/50 dark:from-gray-700/50 dark:to-blue-700/50 rounded-full blur-xl opacity-60"></div>
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-800 dark:to-blue-800 shadow-lg">
                <MessageCircle className="h-10 w-10 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
            
            <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
              No comments yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md leading-relaxed">
              Start engaging with the community by commenting on clippings you find interesting. 
              Your thoughts and insights help build meaningful conversations.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative group">
      {/* Background glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-3xl blur opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
      
      <div className="relative rounded-3xl border border-white/40 dark:border-gray-700/40 bg-gradient-to-br from-white/80 via-white/70 to-white/60 dark:from-gray-900/80 dark:via-gray-800/70 dark:to-gray-900/60 p-8 shadow-2xl backdrop-blur-xl">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 rounded-3xl opacity-15 dark:opacity-8"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(139, 69, 19, 0.1) 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}>
        </div>
        
        <div className="relative">
          {showHeader && (
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur opacity-30"></div>
                  <div className="relative flex items-center gap-3">
                    <MessageCircle className="h-6 w-6 text-blue-500" />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      Recent Comments
                    </h2>
                  </div>
                </div>
                {count > 0 && (
                  <div className="relative">
                    <div className="absolute -inset-1 bg-blue-400/30 rounded-full blur"></div>
                    <span className="relative rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 text-sm font-bold text-white shadow-lg">
                      {count}
                    </span>
                  </div>
                )}
              </div>
              
              {hasMore && (
                <Link
                  href={`/dash/${userDomain || userId}/comments`}
                  className="group/link flex items-center gap-2 rounded-xl bg-blue-100/60 dark:bg-blue-900/30 px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300 transition-all duration-200 hover:bg-blue-200/60 dark:hover:bg-blue-800/40 hover:scale-105 shadow-md"
                >
                  View all
                  <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover/link:translate-x-0.5" />
                </Link>
              )}
            </div>
          )}
          
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
          
          {hasMore && !showHeader && (
            <div className="mt-8 text-center">
              <Link
                href={`/dash/${userDomain || userId}/comments`}
                className="group/more relative inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 text-white font-semibold shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-50 group-hover/more:opacity-70 transition-opacity duration-300"></div>
                <span className="relative">View all {count} comments</span>
                <ChevronRight className="relative h-5 w-5 transition-transform duration-200 group-hover/more:translate-x-1" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RecentComments
