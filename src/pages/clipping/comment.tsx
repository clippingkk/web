import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Avatar from '../../components/avatar/avatar'
import { fetchClipping_clipping_comments } from '../../schema/__generated__/fetchClipping'

type CommentProps = {
  comment: fetchClipping_clipping_comments
}

function Comment(props: CommentProps) {
  const { t } = useTranslation()
  const creator = props.comment.creator
  const [isFold, setIsFold] = useState(true)

  const commentLines = props.comment.content.split('\n')

  const shouldFoldButtonVisible = commentLines.length > 5

  return (
    <div className='flex container mb-6 flex-col lg:flex-row bg-gray-100 bg-opacity-25 lg:p-8 p-6'>
      <div className='flex flex-row lg:flex-col lg:mt-4 items-center'>
        <Avatar
         img={creator.avatar} name={creator.name}
         className='w-12 h-12 lg:h-24 lg:w-24'
         />
        <h5 className='w-24 lg:mt-4 text-center'>{creator.name}</h5>
      </div>

      <div className='flex flex-1 mt-2 lg:mt-0 lg:ml-8 flex-col justify-center items-start transition-all duration-150'>
        {/* <small className='mb-2 font-light'># {props.comment.id}</small> */}
        {commentLines.slice(0, isFold ? 5 : undefined).map((x, i) => (
          <p key={i} className='text-lg'>{x}</p>
        ))}
        {shouldFoldButtonVisible && (
          <button
            className='text-blue-700 hover:text-blue-600 text-lg focus:outline-none'
            onClick={() => {
              setIsFold(v => !v)
            }}
          >{t(isFold ? 'unfold' : 'fold')}</button>
        )}
      </div>
    </div>
  )
}

export default Comment
