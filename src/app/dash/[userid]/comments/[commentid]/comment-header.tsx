'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import ConfirmDialog from '@/components/confirm-dialog/confirm-dialog'
import { useMutation } from '@apollo/client/react'
import { type GetCommentQuery, DeleteCommentDocument, type DeleteCommentMutation } from '@/gql/graphql'
import dayjs from '@/utils/dayjs'

type Props = {
  comment: GetCommentQuery['getComment']
}

function CommentHeader({ comment }: Props) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteComment] = useMutation<DeleteCommentMutation>(DeleteCommentDocument)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteComment({
        variables: { id: comment.id },
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

  const formattedDate = dayjs(new Date(comment.createdAt)).format(
    'YYYY-MM-DD HH:mm:ss'
  )
  const updatedDate =
    comment.updatedAt && comment.updatedAt !== comment.createdAt
      ? dayjs(new Date(comment.updatedAt)).format('YYYY-MM-DD HH:mm:ss')
      : null

  return (
    <div className='flex items-start justify-between'>
      <div className='flex-1'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
          Your Comment
        </h1>
        <div className='flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
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
              <span>
                Reply to{' '}
                <span className='font-medium'>@{comment.replyTo.name}</span>
              </span>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        onConfirm={handleDelete}
        title='Delete Comment'
        message='Are you sure you want to delete this comment? This action cannot be undone.'
        confirmText='Delete'
        cancelText='Cancel'
        variant='danger'
        onCancel={() => setIsDeleting(false)}
      >
        <button
          disabled={isDeleting}
          className='p-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 disabled:opacity-50'
          aria-label='Delete comment'
        >
          {isDeleting ? (
            <svg
              className='w-5 h-5 animate-spin'
              fill='none'
              viewBox='0 0 24 24'
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              />
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              />
            </svg>
          ) : (
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
              />
            </svg>
          )}
        </button>
      </ConfirmDialog>
    </div>
  )
}

export default CommentHeader
