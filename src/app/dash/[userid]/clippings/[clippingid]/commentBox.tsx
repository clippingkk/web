'use client'
import AICommentEnhancer from '@/components/ai/enhance-comment'
import Avatar from '@/components/avatar/avatar'
import Button from '@/components/button/button'
import CKLexicalBaseEditor from '@/components/RichTextEditor'
import { useTranslation } from '@/i18n/client'
import { Clipping, useCreateCommentMutation, User } from '@/schema/generated'
import { toastPromiseDefaultOption } from '@/services/misc'
import { WenquBook } from '@/services/wenqu'
import Tooltip from '@annatarhe/lake-ui/tooltip'
import { useApolloClient } from '@apollo/client'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { $getRoot, LexicalEditor } from 'lexical'
import { Send, User as UserIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'

type CommentBoxProps = {
  book: WenquBook | null
  clipping: Pick<Clipping, 'id' | 'content'>
  me: Pick<User, 'id' | 'name' | 'avatar'>
}

const COMMENT_MIN_LEN = 40

function CommentBox(props: CommentBoxProps) {
  const [content, setContent] = useState('')
  const ed = useRef<LexicalEditor>(null)

  const r = useRouter()

  const [createCommentAction, { loading }] = useCreateCommentMutation({
    refetchQueries: ['fetchClipping'],
    onCompleted: () => {
      r.refresh()
    },
  })
  const client = useApolloClient()

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
        ed.current?.update(() => {
          $getRoot().clear()
        })
      })
    // text: t('app.clipping.comments.tip.success')
  }, [content, createCommentAction, props.clipping.id, t, client])
  const onContentChange = useCallback((md: string) => {
    setContent(md)
  }, [])

  return (
    <div className="mb-6 flex flex-col rounded-lg bg-slate-100/30 p-4 backdrop-blur-sm transition-all duration-300 hover:shadow-md md:flex-row dark:bg-slate-800/30">
      <div className="flex flex-row items-center p-2 md:flex-col md:items-start">
        {props.me.avatar ? (
          <Avatar
            img={props.me.avatar}
            name={props.me.name}
            isPremium={false}
            className="h-10 w-10 md:h-12 md:w-12"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white md:h-12 md:w-12">
            <UserIcon className="h-5 w-5" />
          </div>
        )}
        <Tooltip content={props.me.name}>
          <h5 className="ml-3 max-w-48 overflow-hidden text-sm font-medium text-ellipsis text-slate-700 md:mt-2 md:ml-0 dark:text-slate-300">
            {props.me.name}
          </h5>
        </Tooltip>
      </div>

      <div className="flex flex-1 flex-col justify-center md:pl-4">
        <div className="w-full">
          <CKLexicalBaseEditor
            editable
            className="min-h-40 w-full rounded-lg bg-white p-3 shadow-md transition-all duration-300 focus:ring-2 focus:ring-indigo-500/50 dark:bg-slate-900 dark:text-slate-200"
            markdown={content}
            onContentChange={onContentChange}
            ref={ed}
          />
        </div>

        <div
          className="mt-4 flex w-full flex-col items-center justify-between gap-3 md:flex-row"
          ref={ref}
        >
          <div className="flex items-center">
            {content.length > COMMENT_MIN_LEN ? (
              <div className="flex items-center">
                <AICommentEnhancer
                  bookName={props.book?.title}
                  clippingId={props.clipping.id}
                  comment={content}
                  onAccept={(newComment) => {
                    toast.success('Accept AI enhanced comment!')
                    setContent(newComment)
                  }}
                />
              </div>
            ) : (
              <div className="rounded-full bg-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                {content.length} / {COMMENT_MIN_LEN}{' '}
                {t('app.clipping.comments.count')}
              </div>
            )}
          </div>

          <Button
            variant="primary"
            className="bg-gradient-to-r from-indigo-500 to-purple-500 after:from-indigo-500/40 after:to-purple-500/40 hover:shadow-indigo-500/20"
            isLoading={loading}
            disabled={content.length < COMMENT_MIN_LEN}
            onClick={onSubmit}
            rightIcon={<Send className="h-4 w-4" />}
          >
            {t('app.clipping.comments.submit')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CommentBox
