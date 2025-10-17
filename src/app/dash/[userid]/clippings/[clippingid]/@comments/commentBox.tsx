'use client'
import Tooltip from '@annatarhe/lake-ui/tooltip'
import { useApolloClient } from '@apollo/client'
import { useAutoAnimate } from '@formkit/auto-animate/react'
// Removed Lexical imports for Tiptap migration
import { Info, Send, User as UserIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import AICommentEnhancer from '@/components/ai/enhance-comment'
import Avatar from '@/components/avatar/avatar'
import Button from '@/components/button/button'
import CKLexicalBaseEditor from '@/components/RichTextEditor'
import { useTranslation } from '@/i18n/client'
import {
  type Clipping,
  type User,
  useCreateCommentMutation,
} from '@/schema/generated'
import { toastPromiseDefaultOption } from '@/services/misc'
import type { WenquBook } from '@/services/wenqu'

type CommentBoxProps = {
  book: WenquBook | null
  clipping: Pick<Clipping, 'id' | 'content'>
  me: Pick<User, 'id' | 'name' | 'avatar'>
}

const COMMENT_MIN_LEN = 40

function CommentBox(props: CommentBoxProps) {
  const [content, setContent] = useState('')
  const ed = useRef<{
    update: (callback: () => void) => void
    clear: () => void
  }>(null)

  const r = useRouter()

  const [createCommentAction, { loading }] = useCreateCommentMutation({
    refetchQueries: ['fetchClipping'],
    onCompleted: () => {
      r.refresh()
    },
  })
  const _client = useApolloClient()

  const [ref] = useAutoAnimate()
  const { t } = useTranslation()
  const onSubmit = useCallback(() => {
    if (content.length < COMMENT_MIN_LEN) {
      toast.error(t('app.clipping.comments.tip.tooShort'))
      return
    }

    return toast
      .promise(
        createCommentAction({
          variables: {
            cid: props.clipping.id,
            content: content,
          },
        }),
        toastPromiseDefaultOption
      )
      .then(() => {
        ed.current?.clear()
        setContent('')
      })
    // text: t('app.clipping.comments.tip.success')
  }, [content, createCommentAction, props.clipping.id, t])
  const onContentChange = useCallback((md: string) => {
    setContent(md)
  }, [])

  return (
    <div className='flex gap-4'>
      <div className='flex-shrink-0'>
        {props.me.avatar ? (
          <Avatar
            img={props.me.avatar}
            name={props.me.name}
            isPremium={false}
            className='h-10 w-10'
          />
        ) : (
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-500 text-white'>
            <UserIcon className='h-5 w-5' />
          </div>
        )}
      </div>

      <div className='flex-1 min-w-0'>
        <div className='mb-2'>
          <Tooltip content={props.me.name}>
            <h5 className='text-sm font-medium text-gray-900 dark:text-zinc-100'>
              {props.me.name}
            </h5>
          </Tooltip>
        </div>

        <div className='rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 overflow-hidden transition-all duration-200 focus-within:border-blue-400 dark:focus-within:border-blue-400 focus-within:shadow-sm focus-within:shadow-blue-400/20'>
          <CKLexicalBaseEditor
            editable
            className='min-h-32 w-full p-4 focus:outline-none'
            markdown={content}
            onContentChange={onContentChange}
            ref={ed}
          />
        </div>

        <div className='mt-2 flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400'>
          <Info className='h-3 w-3' />
          <span>
            Tip: You can use markdown syntax (e.g., **bold**, *italic*, `code`,
            [links](url))
          </span>
        </div>

        <div className='mt-3 flex items-center justify-between gap-3' ref={ref}>
          <div className='flex items-center gap-3'>
            {content.length > COMMENT_MIN_LEN ? (
              <AICommentEnhancer
                bookName={props.book?.title}
                clippingId={props.clipping.id}
                comment={content}
                onAccept={(newComment) => {
                  toast.success('Accept AI enhanced comment!')
                  setContent(newComment)
                }}
              />
            ) : (
              <span className='text-xs text-gray-500 dark:text-zinc-400'>
                {content.length} / {COMMENT_MIN_LEN}{' '}
                {t('app.clipping.comments.count')}
              </span>
            )}
          </div>

          <Button
            variant='primary'
            className='bg-blue-400 hover:bg-blue-500 dark:bg-blue-400 dark:hover:bg-blue-500 text-white shadow-sm hover:shadow-md transition-all duration-200'
            isLoading={loading}
            disabled={content.length < COMMENT_MIN_LEN}
            onClick={onSubmit}
            rightIcon={<Send className='h-4 w-4' />}
            size='sm'
          >
            {t('app.clipping.comments.submit')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CommentBox
