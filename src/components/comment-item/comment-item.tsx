import React from 'react'
import Link from 'next/link'
import { MessageCircle, BookOpen, Quote } from 'lucide-react'
import { ProfileQuery } from '@/schema/generated'

type CommentItemProps = {
  comment: NonNullable<ProfileQuery['me']['commentList']['items'][0]>
  showAvatar?: boolean
}

const CommentItem = ({ comment, showAvatar = true }: CommentItemProps) => {
  const clipping = comment.belongsTo
  const creator = clipping.creator

  return (
    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-white/70 via-white/60 to-white/50 p-4 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-lg hover:from-white/80 hover:via-white/70 hover:to-white/60 dark:from-gray-900/70 dark:via-gray-800/60 dark:to-gray-900/50 dark:hover:from-gray-900/80 dark:hover:via-gray-800/70 dark:hover:to-gray-900/60 border border-gray-200/50 dark:border-gray-700/50">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Comment content */}
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
              {comment.content}
            </p>
          </div>
          
          {/* Original clipping context */}
          <div className="rounded-lg bg-gray-50/80 dark:bg-gray-800/50 p-3 border-l-3 border-blue-400 dark:border-blue-500">
            <div className="flex items-start gap-2 mb-2">
              <Quote className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed">
                {clipping.content}
              </p>
            </div>
            
            {/* Original creator info */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                {showAvatar && creator.avatar && (
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                )}
                <Link
                  href={`/dash/${creator.id}`}
                  className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {creator.name}
                </Link>
              </div>
              
              <Link
                href={`/dash/${creator.id}/clippings/${clipping.id}`}
                className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <BookOpen className="h-3 w-3" />
                <span>View clipping</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommentItem