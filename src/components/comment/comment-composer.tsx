'use client'

import Avatar from '@annatarhe/lake-ui/avatar'
import Button from '@annatarhe/lake-ui/button'
import { useMutation } from '@apollo/client/react'
import { Globe, Send } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'

import AICommentEnhancer from '@/components/ai/enhance-comment'
import CKBaseEditor from '@/components/RichTextEditor'
import { CreateBookCommentDocument, CreateCommentDocument } from '@/gql/graphql'
import { useTranslation } from '@/i18n/client'
import { cn } from '@/lib/utils'
import { isRateLimited } from '@/services/apollo-errors'
import { resolveMediaUrl } from '@/utils/image'

import {
  BOOK_COMMENT_MAX_LENGTH,
  COMMENT_MIN_LENGTH,
  type CommentTarget,
} from './target'

type CommentComposerProps = {
  target: CommentTarget
  bookTitle?: string | null
  viewer: { name: string; avatar?: string | null; isPremium: boolean }
  onPosted: () => void
}

function CommentComposer(props: CommentComposerProps) {
  const { target, bookTitle, viewer, onPosted } = props
  const { t } = useTranslation(undefined, 'reading')
  const labelId = useId()
  const editor = useRef<{
    update: (cb: () => void) => void
    clear: () => void
  }>(null)
  const [content, setContent] = useState('')
  const [createComment, { loading: postingComment }] = useMutation(
    CreateCommentDocument
  )
  const [createBookComment, { loading: postingBookComment }] = useMutation(
    CreateBookCommentDocument
  )
  const loading = postingComment || postingBookComment
  const isBook = target.kind === 'book'
  const length = content.trim().length
  const tooLong = isBook && length > BOOK_COMMENT_MAX_LENGTH
  const ready = length >= COMMENT_MIN_LENGTH && !tooLong

  const onSubmit = async () => {
    if (length < COMMENT_MIN_LENGTH) {
      toast.error(t('comments.tooShort', { min: COMMENT_MIN_LENGTH }))
      return
    }
    if (tooLong) {
      toast.error(t('bookComments.tooLong', { max: BOOK_COMMENT_MAX_LENGTH }))
      return
    }
    try {
      if (target.kind === 'book')
        await createBookComment({
          variables: { doubanId: target.doubanId, content },
        })
      else
        await createComment({
          variables: { cid: target.clippingId, content },
        })
      editor.current?.clear()
      setContent('')
      toast.success(t('comments.posted'))
      onPosted()
    } catch (error) {
      toast.error(
        isRateLimited(error) ? t('bookComments.slowDown') : t('comments.failed')
      )
    }
  }

  return (
    <div className="flex gap-3">
      <Avatar
        src={viewer.avatar ? resolveMediaUrl(viewer.avatar) : null}
        name={viewer.name}
        size="sm"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <span id={labelId} className="sr-only">
          {t('comments.label')}
        </span>
        <div
          aria-labelledby={labelId}
          className="rounded-lake-control border-lake-line bg-lake-field focus-within:border-lake-accent focus-within:ring-lake-ring border transition-colors duration-150 focus-within:ring-2"
        >
          <CKBaseEditor
            editable
            className="min-h-28 w-full px-3.5 py-3 outline-none"
            markdown={content}
            onContentChange={setContent}
            placeholder={
              isBook ? t('bookComments.placeholder') : t('comments.placeholder')
            }
            ref={editor}
          />
        </div>
        {isBook ? (
          <p className="rounded-lake-control bg-lake-surface-muted text-lake-fg-muted flex items-start gap-2 px-3 py-2 text-[0.8125rem] leading-snug">
            <Globe
              className="text-lake-fg-subtle mt-0.5 size-3.5 shrink-0"
              aria-hidden="true"
            />
            {t('bookComments.publicNote')}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p
            className={cn(
              'type-meta',
              ((!ready && length > 0) || tooLong) && 'text-lake-warning'
            )}
            aria-live="polite"
          >
            {tooLong
              ? t('bookComments.tooLong', { max: BOOK_COMMENT_MAX_LENGTH })
              : ready
                ? t('comments.ready', { count: length })
                : t('comments.progress', {
                    count: length,
                    min: COMMENT_MIN_LENGTH,
                  })}
            <span className="mx-2" aria-hidden="true">
              ·
            </span>
            {t('comments.markdownTip')}
          </p>
          <div className="flex items-center gap-2">
            {viewer.isPremium && ready ? (
              <AICommentEnhancer
                bookName={bookTitle ?? undefined}
                clippingId={
                  target.kind === 'clipping' ? target.clippingId : undefined
                }
                comment={content}
                onAccept={setContent}
              />
            ) : null}
            <Button
              variant="primary"
              size="sm"
              loading={loading}
              disabled={!ready || loading}
              trailingIcon={<Send className="size-4" />}
              onClick={onSubmit}
            >
              {t('comments.submit')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommentComposer
