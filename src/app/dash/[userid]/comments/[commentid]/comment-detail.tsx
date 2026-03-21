import * as motion from 'motion/react-client'
import Link from 'next/link'

import LinkIndicator from '@/components/link-indicator'
import type { GetCommentQuery } from '@/schema/generated'

import AuthorInfo from './author-info'
import CommentContent from './comment-content'
import CommentHeader from './comment-header'
import RelatedClipping from './related-clipping'

type Props = {
  comment: GetCommentQuery['getComment']
}

function CommentDetail({ comment }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Back navigation */}
      <Link
        href={`/dash/${comment.creator.id}/comments`}
        className="inline-flex items-center text-gray-600 transition-colors duration-200 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
      >
        <LinkIndicator className="mr-2">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </LinkIndicator>
        Back to comments
      </Link>

      {/* Main comment card */}
      <div className="relative rounded-3xl border border-white/50 bg-white/90 p-8 shadow-2xl backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/90">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/5 to-purple-500/5" />

        <div className="relative z-10 space-y-6">
          <CommentHeader comment={comment} />
          <CommentContent content={comment.content} />
        </div>
      </div>

      <RelatedClipping
        clipping={comment.belongsTo}
        creatorId={comment.creator.id}
      />

      <AuthorInfo creator={comment.creator} />
    </motion.div>
  )
}

export default CommentDetail
