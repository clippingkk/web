import { useApolloClient, useMutation } from '@apollo/client'
import React, { useCallback, useState } from 'react'
import { UserContent } from '../../../../../store/user/type'
import { useTranslation } from 'react-i18next'
import Avatar from '../../../../../components/avatar/avatar'
import { Clipping, useCreateCommentMutation } from '../../../../../schema/generated'
import { toast } from 'react-hot-toast'
import { toastPromiseDefaultOption } from '../../../../../services/misc'
import { Button } from '@mantine/core'
import MarkdownEditor from '../../../../../components/markdown-editor/markdown-editor'
import AICommentEnhancer from '../../../../../components/ai/enhance-comment'
import { WenquBook } from '../../../../../services/wenqu'

type CommentBoxProps = {
  book: WenquBook | null
  clipping: Pick<Clipping, 'id' | 'content'>
  me: UserContent
}

const COMMENT_MIN_LEN = 40

function CommentBox(props: CommentBoxProps) {
  const [content, setContent] = useState('')

  const [createCommentAction, { loading }] = useCreateCommentMutation()
  const client = useApolloClient()

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
      refetchQueries: ['fetchClipping'],
    }), toastPromiseDefaultOption).then(() => {
      client.resetStore()
      setContent('')
    })
    // text: t('app.clipping.comments.tip.success')
  }, [content, createCommentAction, props.clipping.id, t, client])

  return (
    <div className='flex container flex-col lg:flex-row'>
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
          <MarkdownEditor
            value={content}
            onValueChange={setContent}
          />
        </div>
        <div className='w-full flex-col lg:flex-row flex items-center justify-between mt-4'>
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
