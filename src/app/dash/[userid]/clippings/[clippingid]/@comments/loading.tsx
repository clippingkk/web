export default function CommentsLoading() {
  return (
    <div className='w-full mb-8'>
      <div className='w-full rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden'>
        <div className='bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-zinc-800 dark:to-zinc-800 p-6 border-b border-gray-200 dark:border-zinc-800'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-blue-400 dark:bg-blue-400 rounded-xl'>
              <div className='h-5 w-5 bg-white rounded'></div>
            </div>
            <div className='h-6 bg-gray-200 dark:bg-zinc-700 rounded-lg w-32 animate-pulse'></div>
          </div>
        </div>
        
        <div className='p-6 space-y-6'>
          {/* Comment input skeleton */}
          <div className='pb-6 border-b border-gray-100 dark:border-zinc-800'>
            <div className="flex gap-4 animate-pulse">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-gray-200 dark:bg-zinc-700 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-2">
                  <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded-lg w-24"></div>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4">
                  <div className="h-32 bg-gray-100 dark:bg-zinc-700 rounded-lg"></div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded-lg w-32"></div>
                  <div className="h-8 bg-gray-200 dark:bg-zinc-700 rounded-lg w-20"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Comments skeleton */}
          <div className='space-y-4'>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl animate-pulse">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-gray-200 dark:bg-zinc-700 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-2">
                    <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded-lg w-24"></div>
                  </div>
                  <div className="rounded-xl bg-gray-100 dark:bg-zinc-800 p-4 border border-gray-200 dark:border-zinc-700">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded-lg w-full"></div>
                      <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded-lg w-5/6"></div>
                      <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded-lg w-4/5"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}