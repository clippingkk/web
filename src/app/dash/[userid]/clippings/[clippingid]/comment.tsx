'use client'
import Avatar from '@/components/avatar/avatar'
import Button from '@/components/button/button'
import CKLexicalBaseEditor from '@/components/RichTextEditor/index'
import { useTranslation } from '@/i18n/client'
import { Comment as CommentData, User } from '@/schema/generated'
import Tooltip from '@annatarhe/lake-ui/tooltip'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { LexicalEditor } from 'lexical'
import { ChevronDown, ChevronUp, User as UserIcon } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'

type CommentProps = {
  comment: Pick<CommentData, 'id' | 'content'> & {
    creator: Pick<User, 'name' | 'avatar'>
  }
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
    <div className="mb-2 flex flex-col rounded-lg transition-all duration-300 hover:bg-slate-100/20 md:flex-row dark:hover:bg-slate-800/30">
      <div className="flex flex-row items-center p-2 md:flex-col md:items-start">
        {creator.avatar ? (
          <Avatar
            img={creator.avatar}
            name={creator.name}
            className="h-10 w-10 ring-2 ring-indigo-400/30 md:h-12 md:w-12 dark:ring-indigo-500/30"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white md:h-12 md:w-12">
            <UserIcon className="h-5 w-5" />
          </div>
        )}
        <Tooltip content={creator.name}>
          <h5 className="ml-3 max-w-48 overflow-hidden text-sm font-medium text-ellipsis text-slate-700 md:mt-2 md:ml-0 dark:text-slate-300">
            {creator.name}
          </h5>
        </Tooltip>
      </div>

      <div className="flex flex-1 flex-col items-start justify-center transition-all duration-300 md:pl-4">
        <div
          ref={foldRef}
          className="overscroll-y-hidden relative w-full rounded-lg bg-slate-100 p-4 shadow-sm backdrop-blur-sm dark:bg-slate-800/70"
          style={{
            height: isFold ? 288 : '100%',
            paddingBottom: isFold ? 0 : 32,
          }}
        >
          <CKLexicalBaseEditor
            editable={false}
            className="w-full rounded-md px-2 transition-all duration-300"
            style={{
              height: isFold ? 192 : '100%',
              overflowY: 'auto',
            }}
            markdown={commentContent}
            ref={ed}
          />
          <div className="absolute right-0 bottom-0 left-0 flex items-end justify-center py-4">
            <Button
              variant="ghost"
              onClick={() => {
                setIsFold((v) => !v)
              }}
              className="bg-white/80 text-indigo-600 hover:bg-white hover:shadow-md dark:bg-slate-700/80 dark:text-indigo-400 dark:hover:bg-slate-700"
              leftIcon={
                isFold ? (
                  <ChevronDown className="h-4 w-4 text-indigo-500" />
                ) : (
                  <ChevronUp className="h-4 w-4 text-indigo-500" />
                )
              }
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
