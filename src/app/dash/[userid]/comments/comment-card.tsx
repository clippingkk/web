'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

import { type Comment, useDeleteCommentMutation } from '@/schema/generated'
import dayjs from '@/utils/dayjs'

type Props = {
  comment: Comment
}

export default function CommentCard({ comment }: Props) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteComment] = useDeleteCommentMutation()

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm('Are you sure you want to delete this comment?')) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteComment({
        variables: { id: comment.id },
        update: (cache) => {
          cache.evict({ id: cache.identify(comment) })
          cache.gc()
        },
      })
      toast.success('Comment deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Failed to delete comment:', error)
      toast.error('Failed to delete comment')
    } finally {
      setIsDeleting(false)
    }
  }

  const formattedDate = dayjs(new Date(comment.createdAt)).format('MMM d, yyyy')
  const truncatedContent =
    comment.content.length > 150
      ? `${comment.content.substring(0, 150)}...`
      : comment.content

  return (
    <Link href={`/dash/${comment.creator.id}/comments/${comment.id}`}>
      <div className="group relative h-full rounded-2xl border border-white/40 bg-white/80 p-6 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-blue-500/50 hover:shadow-2xl dark:border-gray-700/40 dark:bg-gray-900/80 dark:hover:border-purple-500/50">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col">
          {/* Clipping title */}
          <div className="mb-3">
            <h3 className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">
              On clipping:
            </h3>
            <p className="line-clamp-2 text-base font-semibold text-gray-900 dark:text-white">
              {comment.belongsTo.title}
            </p>
          </div>

          {/* Comment content */}
          <div className="mb-4 flex-1">
            <p className="line-clamp-4 text-gray-700 dark:text-gray-300">
              {truncatedContent}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              {comment.replyTo && (
                <span className="text-gray-500 dark:text-gray-400">
                  Reply to @{comment.replyTo.name}
                </span>
              )}
              <span className="text-gray-500 dark:text-gray-400">
                {formattedDate}
              </span>
            </div>

            {/* Delete button */}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:text-red-600 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
              aria-label="Delete comment"
            >
              {isDeleting ? (
                <svg
                  className="h-5 w-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Decorative gradient glow */}
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-20" />
      </div>
    </Link>
  )
}
