'use client'
import React, { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Avatar from '@/components/avatar/avatar'
import { Comment as CommentData, User } from '@/schema/generated'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import Button from '@/components/button'
import { ChevronDown, ChevronUp, User as UserIcon } from 'lucide-react'
import CKLexicalBaseEditor from '@/components/RichTextEditor/index'
import { LexicalEditor } from 'lexical'
import Tooltip from '@annatarhe/lake-ui/tooltip'

type CommentProps = {
  comment: Pick<CommentData, 'id' | 'content'> & { creator: Pick<User, 'name' | 'avatar'> }
}

function Comment(props: CommentProps) {
  const { t } = useTranslation()
  const creator = props.comment.creator
  const [isFold, setIsFold] = useState(true)

  const commentLines = props.comment.content.split('\n')
  const [foldRef] = useAutoAnimate()

  const ed = useRef<LexicalEditor>(null)

  const commentContent = useMemo(() => {
    return props.comment.content
  }, [props.comment.content, isFold, commentLines])

  return (
    <div className='flex mb-2 flex-col md:flex-row rounded-lg transition-all duration-300 hover:bg-slate-100/20 dark:hover:bg-slate-800/30'>
      <div className='flex flex-row md:flex-col items-center md:items-start p-2'>
        {creator.avatar ? (
          <Avatar
            img={creator.avatar}
            name={creator.name}
            className='w-10 h-10 md:w-12 md:h-12 ring-2 ring-indigo-400/30 dark:ring-indigo-500/30'
          />
        ) : (
          <div className='w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white'>
            <UserIcon className='w-5 h-5' />
          </div>
        )}
        <Tooltip content={creator.name}>
          <h5 className='ml-3 md:ml-0 md:mt-2 text-sm font-medium text-slate-700 dark:text-slate-300 max-w-48 overflow-hidden text-ellipsis'>
            {creator.name}
          </h5>
        </Tooltip>
      </div>

      <div className='flex flex-1 md:pl-4 flex-col justify-center items-start transition-all duration-300'>
        <div
          ref={foldRef}
          className='p-4 bg-slate-100 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg w-full overscroll-y-hidden relative shadow-sm'
          style={{
            height: isFold ? 288 : '100%',
            paddingBottom: isFold ? 0 : 32
          }}
        >
          <CKLexicalBaseEditor
            editable={false}
            className='w-full px-2 rounded-md transition-all duration-300'
            style={{
              height: isFold ? 192 : '100%',
              overflowY: 'auto'
            }}
            markdown={commentContent}
            ref={ed}
          />
          <div
            className='absolute bottom-0 right-0 left-0 flex items-end justify-center py-4'
          >
            <Button
              variant='ghost'
              onClick={() => {
                setIsFold(v => !v)
              }}
              className='bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 hover:shadow-md'
              leftIcon={isFold ? 
                <ChevronDown className='w-4 h-4 text-indigo-500' /> : 
                <ChevronUp className='w-4 h-4 text-indigo-500' />}
              size="sm"
            >
              {t(isFold ? 'unfold' : 'fold')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Comment
