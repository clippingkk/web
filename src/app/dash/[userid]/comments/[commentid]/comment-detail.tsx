'use client'

import { GetCommentQuery } from '@/schema/generated'
import dayjs from '@/utils/dayjs'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useDeleteCommentMutation } from '@/schema/generated'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

type Props = {
  comment: GetCommentQuery['getComment']
}

export default function CommentDetail({ comment }: Props) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteComment] = useDeleteCommentMutation()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteComment({
        variables: { id: comment.id }
      })
      toast.success('Comment deleted successfully')
      router.push(`/dash/${comment.creator.id}/comments`)
    } catch (error) {
      console.error('Failed to delete comment:', error)
      toast.error('Failed to delete comment')
    } finally {
      setIsDeleting(false)
    }
  }

  const formattedDate = dayjs(new Date(comment.createdAt)).format('MMMM d, yyyy \'at\' h:mm a')
  const updatedDate = comment.updatedAt && comment.updatedAt !== comment.createdAt
    ? dayjs(new Date(comment.updatedAt)).format('MMMM d, yyyy \'at\' h:mm a')
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Back navigation */}
      <Link 
        href={`/dash/${comment.creator.id}/comments`}
        className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to comments
      </Link>

      {/* Main comment card */}
      <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8 border border-white/50 dark:border-gray-700/50 shadow-2xl">
        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl" />
        
        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Your Comment
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Posted on {formattedDate}</span>
                {updatedDate && (
                  <>
                    <span>•</span>
                    <span>Updated on {updatedDate}</span>
                  </>
                )}
                {comment.replyTo && (
                  <>
                    <span>•</span>
                    <span>Reply to <span className="font-medium">@{comment.replyTo.name}</span></span>
                  </>
                )}
              </div>
            </div>
            
            {/* Delete button */}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 disabled:opacity-50"
              aria-label="Delete comment"
            >
              {isDeleting ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Comment content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>
        </div>
      </div>

      {/* Related clipping card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Original Clipping
        </h2>
        <Link 
          href={`/dash/${comment.creator.id}/clippings/${comment.belongsTo.id}`}
          className="block group"
        >
          <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl">
            {/* Hover gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
                {comment.belongsTo.title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
                {comment.belongsTo.content}
              </p>
              <div className="mt-4 flex items-center text-sm text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                <span>View clipping</span>
                <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Author info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/40 dark:border-gray-700/40"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Author
        </h2>
        <div className="flex items-center space-x-4">
          {comment.creator.avatar ? (
            <img 
              src={comment.creator.avatar} 
              alt={comment.creator.name}
              className="w-16 h-16 rounded-full border-2 border-white dark:border-gray-700"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
              {comment.creator.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {comment.creator.name}
            </h3>
            {comment.creator.bio && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {comment.creator.bio}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
