export default function CommentsLoading() {
  return (
    <div className='w-full mb-8'>
      <div className='relative w-full rounded-2xl overflow-hidden'>
        {/* Subtle texture overlay */}
        <div className='absolute inset-0 opacity-[0.015] dark:opacity-[0.02] pointer-events-none'>
          <svg width="100%" height="100%">
            <pattern id="comments-loading-texture" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.5" fill="currentColor" className='text-gray-900 dark:text-white' />
            </pattern>
            <rect width="100%" height="100%" fill="url(#comments-loading-texture)" />
          </svg>
        </div>
        
        {/* Main container with gradient background */}
        <div className='relative bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 dark:from-zinc-900 dark:via-zinc-900/95 dark:to-blue-900/10 border border-gray-200/80 dark:border-zinc-800/60 shadow-sm backdrop-blur-sm'>
          {/* Header with enhanced gradient */}
          <div className='relative bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/70 dark:from-zinc-800/90 dark:via-blue-900/20 dark:to-indigo-900/10 p-6 border-b border-gray-200/60 dark:border-zinc-800/50 backdrop-blur-sm'>
            {/* Subtle glow effect */}
            <div className='absolute inset-0 bg-gradient-to-r from-blue-400/5 to-indigo-400/5 dark:from-blue-400/10 dark:to-indigo-400/10' />
            
            <div className='relative flex items-center gap-3'>
              <div className='p-2 bg-gradient-to-br from-blue-400 to-blue-500 dark:from-blue-400 dark:to-blue-500 rounded-xl shadow-sm shadow-blue-400/20 dark:shadow-blue-400/20'>
                <div className='h-5 w-5 bg-white rounded animate-pulse'></div>
              </div>
              <div className='h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-32 animate-pulse'></div>
            </div>
          </div>
          
          <div className='relative p-6 space-y-6'>
            {/* Comment input skeleton with gradient shimmer */}
            <div className='pb-6 border-b border-gray-100/50 dark:border-zinc-800/50'>
              <div className="flex gap-4 animate-pulse">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-2">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-24"></div>
                  </div>
                  <div className="rounded-xl border border-gray-200/50 dark:border-zinc-700/50 bg-gradient-to-br from-white to-gray-50 dark:from-zinc-800 dark:to-zinc-800/50 p-4">
                    <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-700 dark:to-zinc-600 rounded-lg"></div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-32"></div>
                    <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-20"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Comments skeleton with gradient effects */}
            <div className='space-y-4'>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl animate-pulse">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-2">
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-24"></div>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-gray-100/80 to-gray-200/50 dark:from-zinc-800/80 dark:to-zinc-700/30 p-4 border border-gray-200/30 dark:border-zinc-700/30 backdrop-blur-sm">
                      <div className="space-y-2">
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-full"></div>
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-5/6"></div>
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-4/5"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}