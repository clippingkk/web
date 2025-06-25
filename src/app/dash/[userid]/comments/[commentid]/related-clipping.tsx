import { GetCommentQuery } from '@/schema/generated'
import Link from 'next/link'
import * as motion from 'motion/react-client'

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
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Original Clipping
      </h2>
      <Link 
        href={`/dash/${creatorId}/clippings/${clipping.id}`}
        className="block group"
      >
        <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
              {clipping.title}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
              {clipping.content}
            </p>
            <div className="mt-4 flex items-center text-sm text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
              <span>View clipping</span>
              <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
