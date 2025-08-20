'use client'
import Tooltip from '@annatarhe/lake-ui/tooltip'
import type { LexicalEditor } from 'lexical'
import { Trash2, User as UserIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'
import { toast } from 'react-hot-toast'
import Avatar from '@/components/avatar/avatar'
import ConfirmDialog from '@/components/confirm-dialog/confirm-dialog'
import CKLexicalBaseEditor from '@/components/RichTextEditor/index'
import {
  type Comment as CommentData,
  type User,
  useDeleteCommentMutation,
} from '@/schema/generated'

type CommentProps = {
  comment: Pick<CommentData, 'id' | 'content'> & {
    creator: Pick<User, 'id' | 'name' | 'avatar'>
  }
  currentUser?: Pick<User, 'id'>
}

function Comment(props: CommentProps) {
  const { comment, currentUser } = props
  const creator = comment.creator
  const ed = useRef<LexicalEditor>(null)
  const router = useRouter()
  const [deleteComment, { loading: isDeleting }] = useDeleteCommentMutation({
    onCompleted: () => {
      toast.success('Comment deleted successfully')
      router.refresh()
    },
    onError: (error) => {
      console.error('Failed to delete comment:', error)
      toast.error('Failed to delete comment')
    },
  })

  const canDelete = currentUser && currentUser.id === creator.id

  const handleDelete = () => {
    deleteComment({
      variables: { id: comment.id },
    })
  }

  return (
    <div className="group flex gap-4 p-4 rounded-xl transition-all duration-200 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
      <div className="flex-shrink-0">
        {creator.avatar ? (
          <Avatar
            img={creator.avatar}
            name={creator.name}
            className="h-10 w-10"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-500 text-white">
            <UserIcon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="mb-2 flex items-center justify-between">
          <Tooltip content={creator.name}>
            <h5 className="text-sm font-medium text-gray-900 dark:text-zinc-100 truncate">
              {creator.name}
            </h5>
          </Tooltip>

          {canDelete && (
            <ConfirmDialog
              onConfirm={handleDelete}
              title="Delete Comment"
              message="Are you sure you want to delete this comment? This action cannot be undone."
              confirmText="Delete"
              cancelText="Cancel"
              variant="danger"
              onCancel={() => {}}
            >
              <button
                disabled={isDeleting}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 disabled:opacity-50"
                aria-label="Delete comment"
              >
                {isDeleting ? (
                  <svg
                    className="w-4 h-4 animate-spin"
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
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </ConfirmDialog>
          )}
        </div>

        <div className="rounded-xl bg-gray-100 dark:bg-zinc-800 p-4 border border-gray-200 dark:border-zinc-700">
          <CKLexicalBaseEditor
            editable={false}
            className="prose prose-sm dark:prose-invert w-full"
            markdown={comment.content}
            ref={ed}
          />
        </div>
      </div>
    </div>
  )
}

export default Comment
