import React from 'react'
import { fetchClipping_clipping_comments } from '../../schema/__generated__/fetchClipping'

type CommentProps = {
  comment: fetchClipping_clipping_comments
}

function Comment(props: CommentProps) {
  const creator = props.comment.creator
  return (
    <div className='flex container mb-6 bg-gray-100 bg-opacity-25 p-8'>
      <div className='flex flex-col mt-4'>
        <img
          src={creator.avatar}
          alt={creator.name}
          className='w-24 rounded-full'
        />
        <h5 className='w-24 mt-4 text-center'>{creator.name}</h5>
      </div>

      <div className='flex flex-1 ml-8 flex-col justify-center items-start h-64 overflow-y-scroll'>
        {props.comment.content.split('\n').map(x => (
          <p>{x}</p>
        ))}
      </div>
    </div>
  )
}

export default Comment
