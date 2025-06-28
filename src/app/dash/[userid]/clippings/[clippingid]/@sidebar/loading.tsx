export default function SidebarLoading() {
  return (
    <div className="flex-1 lg:max-w-sm">
      <div className="sticky top-24">
        <div className="mb-6 animate-pulse">
          {/* Book cover skeleton */}
          <div className="w-full h-96 bg-gray-200 dark:bg-zinc-700 rounded-lg mb-4"></div>
          
          {/* Book info skeleton */}
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 dark:bg-zinc-700 rounded-lg w-3/4"></div>
            <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded-lg w-1/2"></div>
            <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded-lg w-2/3"></div>
          </div>
          
          {/* Action buttons skeleton */}
          <div className="mt-6 space-y-3">
            <div className="h-10 bg-gray-200 dark:bg-zinc-700 rounded-lg w-full"></div>
            <div className="h-10 bg-gray-200 dark:bg-zinc-700 rounded-lg w-full"></div>
            <div className="h-10 bg-gray-200 dark:bg-zinc-700 rounded-lg w-full"></div>
          </div>
          
          {/* Navigation skeleton */}
          <div className="mt-8 space-y-2">
            <div className="h-8 bg-gray-200 dark:bg-zinc-700 rounded-lg w-full"></div>
            <div className="h-8 bg-gray-200 dark:bg-zinc-700 rounded-lg w-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}