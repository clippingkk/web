import * as motion from 'motion/react-client'
import Link from 'next/link'

import type { GetCommentQuery } from '@/schema/generated'

type Props = {
  clipping: GetCommentQuery['getComment']['belongsTo']
  creatorId: number
}

export default function RelatedClipping({ clipping, creatorId }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Original Clipping
      </h2>
      <Link
        href={`/dash/${creatorId}/clippings/${clipping.id}`}
        className="group block"
      >
        <div className="relative rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-purple-50 p-6 backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] hover:border-blue-400 hover:shadow-xl dark:border-blue-700/50 dark:from-blue-900/20 dark:to-purple-900/20 dark:hover:border-blue-500">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="relative z-10">
            <h3 className="mb-3 line-clamp-2 text-xl font-semibold text-gray-900 dark:text-white">
              {clipping.title}
            </h3>
            <p className="line-clamp-3 text-gray-700 dark:text-gray-300">
              {clipping.content}
            </p>
            <div className="mt-4 flex items-center text-sm text-blue-600 group-hover:text-blue-700 dark:text-blue-400 dark:group-hover:text-blue-300">
              <span>View clipping</span>
              <svg
                className="ml-1 h-4 w-4 transform transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
