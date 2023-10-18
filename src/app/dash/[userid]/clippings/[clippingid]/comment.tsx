import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Avatar from '../../../../../components/avatar/avatar'
import { Comment as CommentData, User } from '../../../../../schema/generated'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { Button } from '@mantine/core'
import { ArrowDownIcon } from '@heroicons/react/24/solid'
import { ArrowUpIcon } from '@heroicons/react/24/outline'
import MarkdownPreview from '../../../../../components/markdown-editor/md-preview'

type CommentProps = {
  comment: Pick<CommentData, 'id' | 'content'> & { creator: Pick<User, 'name' | 'avatar'> }
}

function Comment(props: CommentProps) {
  const { t } = useTranslation()
  const creator = props.comment.creator
  const [isFold, setIsFold] = useState(true)

  const commentLines = props.comment.content.split('\n')
  const shouldFoldButtonVisible = commentLines.length > 5
  const [foldRef] = useAutoAnimate()

  const commentContent = useMemo(() => {
    if (isFold) {
      return commentLines.slice(0, 5).join('\n\n')
    }
    return props.comment.content
  }, [props.comment.content, isFold, commentLines])

  return (
    <div className='flex container mb-6 flex-col lg:flex-row bg-gray-100 bg-opacity-25 lg:p-8 p-6 rounded'>
      <div className='flex flex-row lg:flex-col lg:mt-4 items-center'>
        <Avatar
          img={creator.avatar} name={creator.name}
          className='w-12 h-12 lg:h-24 lg:w-24'
        />
        <h5 className='w-24 lg:mt-4 text-center'>{creator.name}</h5>
      </div>

      <div className='flex flex-1 mt-2 lg:mt-0 lg:ml-8 flex-col justify-center items-start transition-all duration-150' ref={foldRef}>
        <div className='p-4 bg-gray-100 bg-opacity-90 rounded w-full'>
          <MarkdownPreview value={commentContent} />
        </div>
        {shouldFoldButtonVisible && (
          <Button
            onClick={() => {
              setIsFold(v => !v)
            }}
            leftSection={isFold ? <ArrowDownIcon className='w-4 h-4' /> : <ArrowUpIcon className='w-4 h-4' />}
          >
            {t(isFold ? 'unfold' : 'fold')}
          </Button>
        )}
      </div>
    </div>
  )
}

export default Comment
