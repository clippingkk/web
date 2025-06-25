import React from 'react'
import { MessageCircle, ChevronRight } from 'lucide-react'
import Link from 'next/link'

type RecentCommentsHeaderProps = {
  count: number
  userId: number
  userDomain?: string | null
}

export default function RecentCommentsHeader({ count, userId, userDomain }: RecentCommentsHeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Recent Comments
          </h2>
        </div>
        {count > 0 && (
          <span className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 text-sm font-bold text-white shadow-lg">
            {count}
          </span>
        )}
      </div>
      
      <Link
        href={`/dash/${userDomain || userId}/comments`}
        className="group/link flex items-center gap-2 rounded-xl bg-blue-100/60 dark:bg-blue-900/30 px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300 transition-all duration-200 hover:bg-blue-200/60 dark:hover:bg-blue-800/40 hover:scale-105 shadow-md"
      >
        View all
        <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover/link:translate-x-0.5" />
      </Link>
    </div>
  )
}