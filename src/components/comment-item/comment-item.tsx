import { BookOpen, MessageCircle, Quote } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
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
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative rounded-2xl bg-gradient-to-br from-white/80 via-white/70 to-white/60 dark:from-gray-900/80 dark:via-gray-800/70 dark:to-gray-900/60 p-5 shadow-lg backdrop-blur-xl border border-white/40 dark:border-gray-700/40 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-blue-300/50 dark:hover:border-blue-500/50">
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
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur opacity-50"></div>
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            {/* Enhanced comment content */}
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl blur"></div>
              <div className="relative bg-white/60 dark:bg-gray-800/60 rounded-xl p-4 border border-blue-200/30 dark:border-blue-700/30">
                <p className="text-gray-900 dark:text-gray-100 leading-relaxed font-medium">
                  {comment.content}
                </p>
              </div>
            </div>

            {/* Enhanced original clipping context */}
            <div className="relative group/quote">
              <div className="absolute -inset-1 bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-xl blur opacity-50"></div>
              <div className="relative rounded-xl bg-gradient-to-br from-gray-50/90 to-gray-100/90 dark:from-gray-800/90 dark:to-gray-700/90 p-4 border-gradient-to-b from-blue-400 to-purple-500 shadow-inner">
                {/* Quote content */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-blue-400/30 rounded-full blur"></div>
                    <Quote className="relative h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed italic">
                    {clipping.content}
                  </p>
                </div>

                {/* Enhanced creator info */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200/60 dark:border-gray-600/60">
                  <div className="flex items-center gap-3">
                    {showAvatar && creator.avatar && (
                      <div className="relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur opacity-50"></div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={creator.avatar}
                          alt={creator.name}
                          className="relative h-6 w-6 rounded-full object-cover ring-2 ring-white/60 dark:ring-gray-700/60"
                        />
                      </div>
                    )}
                    <Link
                      href={`/dash/${creator.id}/profile`}
                      className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-105"
                    >
                      {creator.name}
                    </Link>
                  </div>

                  <Link
                    href={`/dash/${creator.id}/clippings/${clipping.id}`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-100/60 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200/60 dark:hover:bg-blue-800/40 transition-all duration-200 hover:scale-105 text-xs font-medium"
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
