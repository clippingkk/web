import * as motion from 'motion/react-client'
import Image from 'next/image'

import { glassCardClass } from '@/components/card/glass-card'
import type { GetCommentQuery } from '@/schema/generated'

type Props = {
  creator: GetCommentQuery['getComment']['creator']
}

function AuthorInfo({ creator }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={glassCardClass}
    >
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Author
      </h2>
      <div className="flex items-center space-x-4">
        {creator.avatar ? (
          <Image
            src={creator.avatar}
            alt={creator.name}
            className="h-16 w-16 rounded-full border-2 border-white dark:border-gray-700"
            width={64}
            height={64}
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-xl font-bold text-white">
            {creator.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {creator.name}
          </h3>
          {creator.bio && (
            <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
              {creator.bio}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default AuthorInfo
