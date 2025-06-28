'use client'
import Avatar from '@/components/avatar/avatar'
import CKLexicalBaseEditor from '@/components/RichTextEditor/index'
import { Comment as CommentData, User } from '@/schema/generated'
import Tooltip from '@annatarhe/lake-ui/tooltip'
import { LexicalEditor } from 'lexical'
import { User as UserIcon } from 'lucide-react'
import { useRef } from 'react'

type CommentProps = {
  comment: Pick<CommentData, 'id' | 'content'> & {
    creator: Pick<User, 'name' | 'avatar'>
  }
}

function Comment(props: CommentProps) {
  const creator = props.comment.creator
  const ed = useRef<LexicalEditor>(null)

  return (
    <div className="group flex gap-4 p-4 rounded-xl transition-all duration-200 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
      <div className="flex-shrink-0">
        {creator.avatar ? (
          <Avatar
            img={creator.avatar}
            name={creator.name}
            className="h-10 w-10"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-500 text-white">
            <UserIcon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="mb-2">
          <Tooltip content={creator.name}>
            <h5 className="text-sm font-medium text-gray-900 dark:text-zinc-100 truncate">
              {creator.name}
            </h5>
          </Tooltip>
        </div>
        
        <div className="rounded-xl bg-gray-100 dark:bg-zinc-800 p-4 border border-gray-200 dark:border-zinc-700">
          <CKLexicalBaseEditor
            editable={false}
            className="prose prose-sm dark:prose-invert max-w-none"
            markdown={props.comment.content}
            ref={ed}
          />
        </div>
      </div>
    </div>
  )
}

export default Comment
