export default function ContentLoading() {
  return (
    <div className="relative w-full flex-3 rounded-xl overflow-hidden">
      {/* Subtle texture overlay */}
      <div className='absolute inset-0 opacity-[0.01] dark:opacity-[0.015] pointer-events-none z-10'>
        <svg width="100%" height="100%">
          <pattern id="content-loading-texture" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill="currentColor" className='text-gray-900 dark:text-white' />
            <circle cx="4" cy="4" r="0.8" fill="currentColor" className='text-gray-900 dark:text-white' />
          </pattern>
          <rect width="100%" height="100%" fill="url(#content-loading-texture)" />
        </svg>
      </div>

      {/* Main container with gradient background */}
      <div
        className='relative bg-gradient-to-br from-white/90 via-gray-50/80 to-blue-50/60 dark:from-slate-800/90 dark:via-slate-800/80 dark:to-blue-900/20 w-full p-4 lg:p-10 shadow-sm border border-gray-200/40 dark:border-zinc-700/40'
        style={{
          backdropFilter: 'blur(5px)',
        }}
      >
        {/* Additional gradient overlay for depth */}
        <div className='absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-blue-400/[0.02] dark:to-blue-400/[0.04] pointer-events-none' />
        
        {/* Content */}
        <div className='relative z-10 animate-pulse'>
          {/* Title skeleton with gradient */}
          <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-3/4 mb-4"></div>
          
          {/* Author skeleton with gradient */}
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-1/2 mb-4"></div>
          
          <hr className="my-12 border-gray-300/50 dark:border-zinc-700/50" />
          
          {/* Content skeleton with varied gradients */}
          <div className="space-y-4">
            <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-250 to-gray-300 dark:from-zinc-700 dark:via-zinc-650 dark:to-zinc-600 rounded-lg w-full"></div>
            <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-250 to-gray-300 dark:from-zinc-700 dark:via-zinc-650 dark:to-zinc-600 rounded-lg w-full"></div>
            <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-250 to-gray-300 dark:from-zinc-700 dark:via-zinc-650 dark:to-zinc-600 rounded-lg w-5/6"></div>
            <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-250 to-gray-300 dark:from-zinc-700 dark:via-zinc-650 dark:to-zinc-600 rounded-lg w-4/5"></div>
          </div>
          
          <hr className="my-12 border-gray-300/50 dark:border-zinc-700/50" />
          
          {/* Reactions skeleton with gradient */}
          <div className="flex gap-4 mb-8">
            <div className="h-10 w-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg shadow-sm"></div>
            <div className="h-10 w-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg shadow-sm"></div>
            <div className="h-10 w-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg shadow-sm"></div>
          </div>
          
          <hr className="my-12 border-gray-300/50 dark:border-zinc-700/50" />
          
          {/* Footer skeleton with gradients */}
          <footer className="mt-4 flex flex-col justify-between lg:flex-row">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-full"></div>
              <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-32"></div>
            </div>
            <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-40 mt-4 lg:mt-0"></div>
          </footer>
        </div>
      </div>
    </div>
  )
}