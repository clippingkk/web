import { GetCommentQuery } from '@/schema/generated'
import * as motion from 'motion/react-client'

type Props = {
  creator: GetCommentQuery['getComment']['creator']
}

function AuthorInfo({ creator }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/40 dark:border-gray-700/40"
    >
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Author
      </h2>
      <div className="flex items-center space-x-4">
        {creator.avatar ? (
          <img 
            src={creator.avatar} 
            alt={creator.name}
            className="w-16 h-16 rounded-full border-2 border-white dark:border-gray-700"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
            {creator.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {creator.name}
          </h3>
          {creator.bio && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {creator.bio}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default AuthorInfo
