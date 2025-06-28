export default function SidebarLoading() {
  return (
    <div className="flex-1 lg:max-w-sm">
      <div className="sticky top-24">
        <div className="relative rounded-2xl overflow-hidden">
          {/* Subtle texture overlay */}
          <div className='absolute inset-0 opacity-[0.01] dark:opacity-[0.015] pointer-events-none z-10'>
            <svg width="100%" height="100%">
              <pattern id="sidebar-loading-texture" x="0" y="0" width="3" height="3" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="0.5" fill="currentColor" className='text-gray-900 dark:text-white' />
              </pattern>
              <rect width="100%" height="100%" fill="url(#sidebar-loading-texture)" />
            </svg>
          </div>

          {/* Main container with gradient background */}
          <div className='relative bg-gradient-to-br from-white via-gray-50/70 to-gray-100/50 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-800/80 p-6 shadow-sm border border-gray-200/50 dark:border-zinc-800/50 backdrop-blur-sm'>
            {/* Additional gradient overlay */}
            <div className='absolute inset-0 bg-gradient-to-t from-transparent to-blue-400/[0.02] dark:to-blue-400/[0.03] pointer-events-none' />
            
            <div className="relative mb-6 animate-pulse">
              {/* Book cover skeleton with gradient */}
              <div className="w-full h-96 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 dark:from-zinc-700 dark:via-zinc-600 dark:to-zinc-700 rounded-lg mb-4 shadow-sm"></div>
              
              {/* Book info skeleton with gradients */}
              <div className="space-y-3">
                <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-3/4"></div>
                <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-1/2"></div>
                <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-2/3"></div>
              </div>
              
              {/* Action buttons skeleton with gradient effects */}
              <div className="mt-6 space-y-3">
                <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-250 to-gray-300 dark:from-zinc-700 dark:via-zinc-650 dark:to-zinc-600 rounded-lg w-full shadow-sm"></div>
                <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-250 to-gray-300 dark:from-zinc-700 dark:via-zinc-650 dark:to-zinc-600 rounded-lg w-full shadow-sm"></div>
                <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-250 to-gray-300 dark:from-zinc-700 dark:via-zinc-650 dark:to-zinc-600 rounded-lg w-full shadow-sm"></div>
              </div>
              
              {/* Navigation skeleton with subtle gradients */}
              <div className="mt-8 space-y-2">
                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-full"></div>
                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}