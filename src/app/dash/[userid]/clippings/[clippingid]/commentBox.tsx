'use client'
import { useApolloClient } from '@apollo/client'
import React, { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Avatar from '@/components/avatar/avatar'
import { Clipping, useCreateCommentMutation, User } from '@/schema/generated'
import { toast } from 'react-hot-toast'
import { toastPromiseDefaultOption } from '@/services/misc'
import Button from '@/components/button'
import AICommentEnhancer from '@/components/ai/enhance-comment'
import { WenquBook } from '@/services/wenqu'
import CKLexicalBaseEditor from '@/components/RichTextEditor'
import { $getRoot, LexicalEditor } from 'lexical'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { useRouter } from 'next/navigation'
import { Send, User as UserIcon } from 'lucide-react'
import Tooltip from '@annatarhe/lake-ui/tooltip'

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
    }
  })
  const client = useApolloClient()

  const [ref] = useAutoAnimate()
  const { t } = useTranslation()
  const onSubmit = useCallback(() => {
    if (content.length < COMMENT_MIN_LEN) {
      toast.error(t('app.clipping.comments.tip.tooShort'))
      return
    }

    return toast.promise(createCommentAction({
      variables: {
        cid: props.clipping.id,
        content: content
      },
    }), toastPromiseDefaultOption).then(() => {
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
    <div className='flex flex-col md:flex-row mb-6 p-4 rounded-lg bg-slate-100/30 dark:bg-slate-800/30 backdrop-blur-sm transition-all duration-300 hover:shadow-md'>
      <div className='flex flex-row md:flex-col items-center md:items-start p-2'>
        {props.me.avatar ? (
          <Avatar
            img={props.me.avatar}
            name={props.me.name}
            className='w-10 h-10 md:w-12 md:h-12 ring-2 ring-indigo-400/50 dark:ring-indigo-500/50'
          />
        ) : (
          <div className='w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white'>
            <UserIcon className='w-5 h-5' />
          </div>
        )}
        <Tooltip content={props.me.name}>
          <h5 className='ml-3 md:ml-0 md:mt-2 text-sm font-medium text-slate-700 dark:text-slate-300 max-w-48 overflow-hidden text-ellipsis'>
            {props.me.name}
          </h5>
        </Tooltip>
      </div>

      <div className='flex flex-1 md:pl-4 flex-col justify-center'>
        <div className='w-full'>
          <CKLexicalBaseEditor
            editable
            className='w-full min-h-40 p-3 shadow-md bg-white dark:bg-slate-900 dark:text-slate-200 rounded-lg transition-all duration-300 focus:ring-2 focus:ring-indigo-500/50'
            markdown={content}
            onContentChange={onContentChange}
            ref={ed}
          />
        </div>
        
        <div className='w-full flex flex-col md:flex-row items-center justify-between mt-4 gap-3' ref={ref}>
          <div className='flex items-center'>
            {content.length > COMMENT_MIN_LEN ? (
              <div className='flex items-center'>
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
              <div className='px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 rounded-full'>
                {content.length} / {COMMENT_MIN_LEN} {t('app.clipping.comments.count')}
              </div>
            )}
          </div>
          
          <Button
            variant='primary'
            className='bg-gradient-to-r from-indigo-500 to-purple-500 after:from-indigo-500/40 after:to-purple-500/40 hover:shadow-indigo-500/20'
            isLoading={loading}
            disabled={content.length < COMMENT_MIN_LEN}
            onClick={onSubmit}
            rightIcon={<Send className='w-4 h-4' />}
          >
            {t('app.clipping.comments.submit')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CommentBox
