import { GetCommentQuery } from '@/schema/generated'
import Link from 'next/link'
import * as motion from 'motion/react-client'
import CommentHeader from './comment-header'
import CommentContent from './comment-content'
import RelatedClipping from './related-clipping'
import AuthorInfo from './author-info'

type Props = {
  comment: GetCommentQuery['getComment']
}

console.log('CommentDetail component loaded', motion)

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
        className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to comments
      </Link>

      {/* Main comment card */}
      <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8 border border-white/50 dark:border-gray-700/50 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl" />
        
        <div className="relative z-10 space-y-6">
          <CommentHeader comment={comment} />
          <CommentContent content={comment.content} />
        </div>
      </div>

      <RelatedClipping clipping={comment.belongsTo} creatorId={comment.creator.id} />
      
      <AuthorInfo creator={comment.creator} />
    </motion.div>
  )
}

export default CommentDetail
