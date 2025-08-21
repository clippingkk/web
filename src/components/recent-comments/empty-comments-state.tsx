import { MessageCircle } from 'lucide-react'

type EmptyCommentsStateProps = {
  showHeader?: boolean
}

export default function EmptyCommentsState({
  showHeader = true,
}: EmptyCommentsStateProps) {
  return (
    <>
      {showHeader && (
        <div className='mb-6 flex items-center gap-3'>
          <MessageCircle className='h-6 w-6 text-blue-500' />
          <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
            Recent Comments
          </h2>
        </div>
      )}

      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <div className='flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-800 dark:to-blue-800 shadow-lg mb-6'>
          <MessageCircle className='h-10 w-10 text-gray-400 dark:text-gray-500' />
        </div>

        <h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100'>
          No comments yet
        </h3>
        <p className='text-gray-600 dark:text-gray-400 max-w-md leading-relaxed'>
          Start engaging with the community by commenting on clippings you find
          interesting. Your thoughts and insights help build meaningful
          conversations.
        </p>
      </div>
    </>
  )
}
