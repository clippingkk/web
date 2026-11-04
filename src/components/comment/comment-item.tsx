'use client'

import ConfirmDialog from '@annatarhe/lake-ui/confirm-dialog'
import IconButton from '@annatarhe/lake-ui/icon-button'
import { useMutation } from '@apollo/client/react'
import { BookOpen, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

import CKBaseEditor from '@/components/RichTextEditor'
import UserChip from '@/components/user/user-chip'
import { DeleteBookCommentDocument, DeleteCommentDocument } from '@/gql/graphql'
import { useTranslation } from '@/i18n/client'
import { formatDate } from '@/utils/format-date'
import { bookHref, clippingHref, dashHref } from '@/utils/profile.utils'

import { splitClippingLines } from '../clipping/clipping-text'

export type CommentItemData = {
  id: number
  content: string
  createdAt: string
  creator: {
    id: number
    name: string
    avatar?: string | null
    domain?: string | null
  }
  belongsTo?: { id: number; title: string; content: string } | null
  /** Book comments only: the author's highlights in the book you may see. */
  creatorClippingsCount?: number
}

type CommentItemProps = {
  comment: CommentItemData
  viewerId?: number | null
  /** `with-context` quotes the highlight the comment belongs to. */
  variant?: 'thread' | 'with-context'
  /** Set for a comment on a whole book (its Douban id). */
  doubanId?: string
  /** Administrators may remove anyone's book comment. */
  canModerate?: boolean
  onDeleted?: (id: number) => void
}

function CommentItem(props: CommentItemProps) {
  const {
    comment,
    viewerId,
    variant = 'thread',
    doubanId,
    canModerate,
    onDeleted,
  } = props
  const { t, i18n } = useTranslation(undefined, 'reading')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteComment] = useMutation(DeleteCommentDocument)
  const [deleteBookComment] = useMutation(DeleteBookCommentDocument)
  const canDelete =
    (!!viewerId && viewerId === comment.creator.id) ||
    (!!doubanId && !!canModerate)
  const highlights = doubanId ? (comment.creatorClippingsCount ?? 0) : 0
  const excerpt = comment.belongsTo
    ? (splitClippingLines(comment.belongsTo.content, 1)[0] ?? '')
    : ''

  const onDelete = async () => {
    try {
      if (doubanId) await deleteBookComment({ variables: { id: comment.id } })
      else await deleteComment({ variables: { id: comment.id } })
      toast.success(t('comments.deleted'))
      onDeleted?.(comment.id)
    } catch (error) {
      toast.error(t('comments.deleteFailed'))
      throw error
    }
  }

  return (
    <article className="border-lake-line flex flex-col gap-3 border-b py-6 last:border-b-0">
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
          <UserChip
            href={dashHref(comment.creator, 'profile')}
            name={comment.creator.name}
            avatar={comment.creator.avatar}
            detail={
              <time dateTime={comment.createdAt}>
                {formatDate(comment.createdAt, i18n.language)}
              </time>
            }
          />
          {doubanId && highlights > 0 ? (
            <Link
              href={bookHref(comment.creator, doubanId)}
              aria-label={t('bookComments.readerBadgeLabel', {
                count: highlights,
                name: comment.creator.name,
              })}
              className="bg-marker text-lake-fg-muted hover:text-lake-fg focus-visible:ring-lake-ring inline-flex items-center gap-1.5 rounded-full py-0.5 pr-2.5 pl-2 text-xs font-medium transition-colors duration-150 outline-none focus-visible:ring-2"
            >
              <BookOpen className="size-3.5" aria-hidden="true" />
              {t('bookComments.readerBadge', { count: highlights })}
            </Link>
          ) : null}
        </div>
        {canDelete ? (
          <IconButton
            variant="ghost"
            size="sm"
            label={t('comments.delete')}
            icon={<Trash2 className="size-4" />}
            onClick={() => setConfirmOpen(true)}
          />
        ) : null}
      </header>

      {variant === 'with-context' && comment.belongsTo ? (
        <Link
          href={clippingHref(comment.creator, comment.belongsTo.id)}
          className="group rounded-lake-control border-lake-line hover:bg-lake-surface-muted/60 focus-visible:ring-lake-ring block border-l-2 py-1 pl-4 transition-colors duration-150 outline-none focus-visible:ring-2"
        >
          <p className="type-eyebrow truncate">{comment.belongsTo.title}</p>
          <p className="type-quote text-lake-fg-muted mt-1 line-clamp-3">
            {excerpt}
          </p>
        </Link>
      ) : null}

      <div className="text-lake-fg text-[0.9375rem] leading-relaxed">
        <CKBaseEditor editable={false} markdown={comment.content} />
      </div>

      {canDelete ? (
        <ConfirmDialog
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={onDelete}
          tone="danger"
          title={t('comments.deleteTitle')}
          description={t('comments.deleteDescription')}
          confirmLabel={t('comments.confirmDelete')}
          cancelLabel={t('comments.cancel')}
        />
      ) : null}
    </article>
  )
}

export default CommentItem
