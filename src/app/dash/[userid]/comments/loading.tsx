export default function CommentsLoading() {
  return (
    <div className='min-h-screen p-4 md:p-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Header skeleton */}
        <div className='mb-8'>
          <div className='h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse mb-2' />
          <div className='h-5 w-64 bg-gray-200 dark:bg-gray-800 rounded animate-pulse' />
        </div>

        {/* Stats skeleton */}
        <div className='bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/40 dark:border-gray-700/40 mb-6'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-2' />
              <div className='h-8 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse' />
            </div>
            <div className='w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse' />
          </div>
        </div>

        {/* Comments grid skeleton */}
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className='bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/40 dark:border-gray-700/40'
            >
              <div className='space-y-3'>
                <div>
                  <div className='h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-2' />
                  <div className='h-4 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse' />
                </div>
                <div className='space-y-2'>
                  <div className='h-3 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse' />
                  <div className='h-3 w-4/5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse' />
                  <div className='h-3 w-3/5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse' />
                </div>
                <div className='flex justify-between items-center pt-2'>
                  <div className='h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse' />
                  <div className='h-4 w-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse' />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
