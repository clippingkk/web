export default function ContentLoading() {
  return (
    <div className="animate-pulse">
      {/* Title skeleton */}
      <div className="h-8 bg-gray-200 dark:bg-zinc-700 rounded-lg w-3/4 mb-4"></div>
      
      {/* Author skeleton */}
      <div className="h-6 bg-gray-200 dark:bg-zinc-700 rounded-lg w-1/2 mb-4"></div>
      
      <hr className="my-12 bg-gray-400" />
      
      {/* Content skeleton */}
      <div className="space-y-4">
        <div className="h-12 bg-gray-200 dark:bg-zinc-700 rounded-lg w-full"></div>
        <div className="h-12 bg-gray-200 dark:bg-zinc-700 rounded-lg w-full"></div>
        <div className="h-12 bg-gray-200 dark:bg-zinc-700 rounded-lg w-5/6"></div>
        <div className="h-12 bg-gray-200 dark:bg-zinc-700 rounded-lg w-4/5"></div>
      </div>
      
      <hr className="my-12 bg-gray-400" />
      
      {/* Reactions skeleton */}
      <div className="flex gap-4 mb-8">
        <div className="h-10 w-24 bg-gray-200 dark:bg-zinc-700 rounded-lg"></div>
        <div className="h-10 w-24 bg-gray-200 dark:bg-zinc-700 rounded-lg"></div>
        <div className="h-10 w-24 bg-gray-200 dark:bg-zinc-700 rounded-lg"></div>
      </div>
      
      <hr className="my-12 bg-gray-400" />
      
      {/* Footer skeleton */}
      <footer className="mt-4 flex flex-col justify-between lg:flex-row">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-gray-200 dark:bg-zinc-700 rounded-full"></div>
          <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded-lg w-32"></div>
        </div>
        <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded-lg w-40 mt-4 lg:mt-0"></div>
      </footer>
    </div>
  )
}