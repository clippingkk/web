import { useApolloClient, useMutation } from '@apollo/client'
import React, { useCallback, useState } from 'react'
import { UserContent } from '../../../../store/user/type'
import createCommentMutation from '../../../../schema/mutations/create-comment.graphql'
import { createComment, createCommentVariables } from '../../../../schema/mutations/__generated__/createComment'
import swal from 'sweetalert'
import { useTranslation } from 'react-i18next'
import Avatar from '../../../../components/avatar/avatar'

type CommentBoxProps = {
  clippingID: number
  me: UserContent
}

const COMMENT_MIN_LEN = 40

function CommentBox(props: CommentBoxProps) {
  const [content, setContent] = useState('')

  const [createCommentAction, { loading }] = useMutation<createComment, createCommentVariables>(createCommentMutation)
  const client = useApolloClient()

  const { t } = useTranslation()

  const onSubmit = useCallback(() => {
    if (content.length < COMMENT_MIN_LEN) {
      swal({
        icon: 'error',
        text: t('app.clipping.comments.tip.tooShort')
      })
      return
    }

    createCommentAction({
      variables: {
        cid: props.clippingID,
        content: content
      }
    }).then(() => {
      swal({
        icon: 'success',
        text: t('app.clipping.comments.tip.success')
      })
      client.resetStore()
    })
  }, [content, createCommentAction, props.clippingID, t, client])

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
        <textarea className='w-full rounded border-none focus:scale-105 transition-transform duration-75 focus:outline-none p-4 text-lg dark:bg-gray-700 dark:text-gray-200'
          rows={8}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={t('app.clipping.comments.placeholder')}
        />
        <div className='w-full flex-col lg:flex-row flex items-center justify-between px-4 mt-4'>
          <small>{content.length} {t('app.clipping.comments.count')}</small>

          <button
            className={`focus:outline-none px-8 py-4 rounded ${content.length > COMMENT_MIN_LEN ? 'bg-blue-400' : 'bg-gray-500'}`}
            disabled={content.length < COMMENT_MIN_LEN || loading}
            onClick={onSubmit}
          >
            {loading && '🎠'}
            {t('app.clipping.comments.submit')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CommentBox
