'use client'

import Avatar from '@annatarhe/lake-ui/avatar'
import Button from '@annatarhe/lake-ui/button'
import { useMutation } from '@apollo/client/react'
import { Send } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'

import AICommentEnhancer from '@/components/ai/enhance-comment'
import CKBaseEditor from '@/components/RichTextEditor'
import { CreateCommentDocument } from '@/gql/graphql'
import { useTranslation } from '@/i18n/client'
import { cn } from '@/lib/utils'
import { resolveMediaUrl } from '@/utils/image'

export const COMMENT_MIN_LENGTH = 40

type CommentComposerProps = {
  clippingId: number
  bookTitle?: string | null
  viewer: { name: string; avatar?: string | null; isPremium: boolean }
  onPosted: () => void
}

function CommentComposer(props: CommentComposerProps) {
  const { clippingId, bookTitle, viewer, onPosted } = props
  const { t } = useTranslation(undefined, 'reading')
  const labelId = useId()
  const editor = useRef<{
    update: (cb: () => void) => void
    clear: () => void
  }>(null)
  const [content, setContent] = useState('')
  const [createComment, { loading }] = useMutation(CreateCommentDocument)
  const length = content.trim().length
  const ready = length >= COMMENT_MIN_LENGTH

  const onSubmit = async () => {
    if (!ready) {
      toast.error(t('comments.tooShort', { min: COMMENT_MIN_LENGTH }))
      return
    }
    try {
      await createComment({ variables: { cid: clippingId, content } })
      editor.current?.clear()
      setContent('')
      toast.success(t('comments.posted'))
      onPosted()
    } catch {
      toast.error(t('comments.failed'))
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
            ref={editor}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p
            className={cn(
              'type-meta',
              !ready && length > 0 && 'text-lake-warning'
            )}
            aria-live="polite"
          >
            {ready
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
                clippingId={clippingId}
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
