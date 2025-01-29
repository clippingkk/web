'use client'
import { useApolloClient } from '@apollo/client'
import React, { useCallback, useRef, useState } from 'react'
import { UserContent } from '@/store/user/type'
import { useTranslation } from 'react-i18next'
import Avatar from '@/components/avatar/avatar'
import { Clipping, useCreateCommentMutation } from '@/schema/generated'
import { toast } from 'react-hot-toast'
import { toastPromiseDefaultOption } from '@/services/misc'
import { Button } from '@mantine/core'
import AICommentEnhancer from '@/components/ai/enhance-comment'
import { WenquBook } from '@/services/wenqu'
import CKLexicalBaseEditor from '@/components/RichTextEditor'
import { $getRoot, LexicalEditor } from 'lexical'
import { useAutoAnimate } from '@formkit/auto-animate/react'

type CommentBoxProps = {
  book: WenquBook | null
  clipping: Pick<Clipping, 'id' | 'content'>
  me: UserContent
}

const COMMENT_MIN_LEN = 40

function CommentBox(props: CommentBoxProps) {
  const [content, setContent] = useState('')
  const ed = useRef<LexicalEditor>(null)

  const [createCommentAction, { loading }] = useCreateCommentMutation({
    refetchQueries: ['fetchClipping'],
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
    <div className='flex container flex-col lg:flex-row mb-4 lg:p-8 p-6 '>
      <div className='flex flex-row lg:flex-col my-4 lg:mb-0 items-center'>
        <Avatar
          img={props.me.avatar}
          name={props.me.name}
          className='w-12 h-12 lg:h-24 lg:w-24'
        />
        <h5 className='w-24 lg:mt-4 text-center'>{props.me.name}</h5>
      </div>

      <div className='flex flex-1 lg:ml-8 flex-col justify-center items-end'>
        <div className='w-full'>
          <CKLexicalBaseEditor
            editable
            className='w-full min-h-40 px-2 shadow bg-slate-300 dark:bg-slate-800 dark:text-slate-200 focus:outline-none rounded transition-all duration-150'
            markdown={content}
            onContentChange={onContentChange}
            ref={ed}
          />

        </div>
        <div className='w-full flex-col lg:flex-row flex items-center justify-between mt-4 gap-4' ref={ref}>
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
            <small>{content.length} {t('app.clipping.comments.count')}</small>
          )}
          <Button
            color='blue'
            className='bg-sky-500'
            loading={loading}
            disabled={content.length < COMMENT_MIN_LEN}
            onClick={onSubmit}
          >
            {t('app.clipping.comments.submit')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CommentBox
