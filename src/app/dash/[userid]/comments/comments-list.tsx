'use client'

import { useState, useCallback } from 'react'
import { useGetCommentListQuery, GetCommentListQuery } from '@/schema/generated'
// import { useInfiniteLoader } from '@/hooks/use-infinite-loader'
import CommentCard from './comment-card'
import { AnimatePresence, motion } from 'motion/react'
import { Comment } from '@/schema/generated'

type Props = {
  initialData: GetCommentListQuery['getCommentList']
  userId: number
}

export default function CommentsList({ initialData, userId }: Props) {
  const [hasMore, setHasMore] = useState(initialData.items.length >= 20)
  const [lastId, setLastId] = useState<number | undefined>()

  const { data, loading, fetchMore } = useGetCommentListQuery({
    variables: {
      uid: userId,
      pagination: {
        limit: 20,
        lastId
      }
    },
    skip: !lastId, // Skip initial query since we have server data
  })

  const comments = lastId ? data?.getCommentList.items : initialData.items
  const totalCount = data?.getCommentList.count || initialData.count

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadMore = useCallback(async () => {
    if (!hasMore || loading || !comments?.length) return

    const lastComment = comments[comments.length - 1]
    if (!lastComment) return

    try {
      const result = await fetchMore({
        variables: {
          uid: userId,
          pagination: {
            limit: 20,
            lastId: lastComment.id
          }
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev
          
          const newItems = fetchMoreResult.getCommentList.items
          if (newItems.length < 20) {
            setHasMore(false)
          }

          return {
            getCommentList: {
              ...fetchMoreResult.getCommentList,
              items: [...(prev.getCommentList.items || []), ...newItems]
            }
          }
        }
      })

      if (result.data?.getCommentList.items.length) {
        setLastId(result.data.getCommentList.items[result.data.getCommentList.items.length - 1].id)
      }
    } catch (error) {
      console.error('Error loading more comments:', error)
    }
  }, [hasMore, loading, comments, fetchMore, userId])

  // useInfiniteLoader({
  //   hasMore,
  //   loadMore,
  //   loading
  // })

  if (!comments?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-6xl mb-4">💬</div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No comments yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Start engaging with clippings to see your comments here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/40 dark:border-gray-700/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Comments</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCount}</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl">💬</span>
          </div>
        </div>
      </div>

      {/* Comments Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <CommentCard comment={comment as unknown as Comment} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Loading indicator */}
      {loading && hasMore && (
        <div className="flex justify-center py-8">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}
    </div>
  )
}
