import { BookOpen, MessageCircle, Quote } from 'lucide-react'
import Link from 'next/link'

import type { ProfileQuery } from '@/schema/generated'

type CommentItemProps = {
  comment: NonNullable<ProfileQuery['me']['commentList']['items'][0]>
  showAvatar?: boolean
}

const CommentItem = ({ comment, showAvatar = true }: CommentItemProps) => {
  const clipping = comment.belongsTo
  const creator = clipping.creator

  return (
    <div className="group relative">
      {/* Animated background glow */}
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 opacity-0 blur transition-opacity duration-500 group-hover:opacity-100"></div>

      <div className="relative rounded-2xl border border-white/40 bg-gradient-to-br from-white/80 via-white/70 to-white/60 p-5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-blue-300/50 hover:shadow-xl dark:border-gray-700/40 dark:from-gray-900/80 dark:via-gray-800/70 dark:to-gray-900/60 dark:hover:border-blue-500/50">
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 rounded-2xl opacity-10 dark:opacity-5"
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.1) 1px, transparent 0)',
            backgroundSize: '16px 16px',
          }}
        ></div>

        <div className="relative flex gap-4">
          {/* Enhanced comment icon */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-50 blur"></div>
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-4">
            {/* Enhanced comment content */}
            <div className="relative">
              <div className="absolute -inset-2 rounded-xl bg-gradient-to-r from-blue-50/50 to-purple-50/50 blur dark:from-blue-900/20 dark:to-purple-900/20"></div>
              <div className="relative rounded-xl border border-blue-200/30 bg-white/60 p-4 dark:border-blue-700/30 dark:bg-gray-800/60">
                <p className="leading-relaxed font-medium text-gray-900 dark:text-gray-100">
                  {comment.content}
                </p>
              </div>
            </div>

            {/* Enhanced original clipping context */}
            <div className="group/quote relative">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-gray-200/50 to-gray-300/50 opacity-50 blur dark:from-gray-700/50 dark:to-gray-600/50"></div>
              <div className="border-gradient-to-b relative rounded-xl bg-gradient-to-br from-blue-400 from-gray-50/90 to-gray-100/90 to-purple-500 p-4 shadow-inner dark:from-gray-800/90 dark:to-gray-700/90">
                {/* Quote content */}
                <div className="mb-3 flex items-start gap-3">
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-blue-400/30 blur"></div>
                    <Quote className="relative mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="line-clamp-3 leading-relaxed text-gray-700 italic dark:text-gray-300">
                    {clipping.content}
                  </p>
                </div>

                {/* Enhanced creator info */}
                <div className="flex items-center justify-between border-t border-gray-200/60 pt-3 dark:border-gray-600/60">
                  <div className="flex items-center gap-3">
                    {showAvatar && creator.avatar && (
                      <div className="relative">
                        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-50 blur"></div>
                        {}
                        <img
                          src={creator.avatar}
                          alt={creator.name}
                          className="relative h-6 w-6 rounded-full object-cover ring-2 ring-white/60 dark:ring-gray-700/60"
                        />
                      </div>
                    )}
                    <Link
                      href={`/dash/${creator.id}/profile`}
                      className="text-sm font-semibold text-gray-700 transition-all duration-200 hover:scale-105 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                    >
                      {creator.name}
                    </Link>
                  </div>

                  <Link
                    href={`/dash/${creator.id}/clippings/${clipping.id}`}
                    className="flex items-center gap-2 rounded-lg bg-blue-100/60 px-3 py-1.5 text-xs font-medium text-blue-700 transition-all duration-200 hover:scale-105 hover:bg-blue-200/60 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/40"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>View clipping</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommentItem
