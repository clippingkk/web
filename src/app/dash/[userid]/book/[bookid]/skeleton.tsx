function BookPageSkeleton() {
  return (
    <div className='w-full space-y-8 animate-pulse'>
      {/* Book info hero section skeleton */}
      <div className='grid grid-cols-1 md:grid-cols-[280px,1fr] lg:grid-cols-[320px,1fr] gap-6 lg:gap-10 py-6 lg:py-8'>
        {/* Book cover skeleton */}
        <div className='mx-auto w-full max-w-[320px]'>
          <div className='w-full aspect-[4/5] bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 dark:from-zinc-700 dark:via-zinc-600 dark:to-zinc-700 rounded-xl shadow-sm' />
          {/* Mobile share button skeleton */}
          <div className='mt-6 md:hidden'>
            <div className='h-12 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-xl' />
          </div>
        </div>

        {/* Book details skeleton */}
        <div className='space-y-6'>
          {/* Title */}
          <div className='space-y-3'>
            <div className='h-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-3/4' />
            <div className='flex items-center gap-2'>
              <div className='h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-1/3' />
              <div className='h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-full w-16' />
            </div>
            {/* Tags skeleton */}
            <div className='flex gap-2'>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className='h-6 bg-gray-200 dark:bg-zinc-700 rounded-full w-16'
                />
              ))}
            </div>
          </div>

          {/* Stats bar skeleton */}
          <div className='flex flex-wrap gap-3'>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className='flex items-center gap-3 rounded-xl border border-gray-200/40 dark:border-zinc-700/40 bg-white/40 dark:bg-zinc-800/40 px-4 py-3'
              >
                <div className='h-8 w-8 bg-gray-200 dark:bg-zinc-700 rounded-lg' />
                <div className='space-y-1'>
                  <div className='h-5 bg-gray-200 dark:bg-zinc-700 rounded w-12' />
                  <div className='h-3 bg-gray-200 dark:bg-zinc-700 rounded w-16' />
                </div>
              </div>
            ))}
          </div>

          {/* Share button skeleton (desktop) */}
          <div className='hidden md:block'>
            <div className='h-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-xl w-32' />
          </div>

          {/* Meta section skeleton */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className='flex items-center gap-3 rounded-xl border border-gray-200/40 dark:border-zinc-700/40 bg-white/40 dark:bg-zinc-800/40 p-3'
              >
                <div className='h-9 w-9 bg-gray-200 dark:bg-zinc-700 rounded-lg' />
                <div className='space-y-1'>
                  <div className='h-3 bg-gray-200 dark:bg-zinc-700 rounded w-16' />
                  <div className='h-4 bg-gray-200 dark:bg-zinc-700 rounded w-24' />
                </div>
              </div>
            ))}
          </div>

          {/* Summary skeleton */}
          <div className='rounded-xl border border-gray-200/40 dark:border-zinc-700/40 bg-white/40 dark:bg-zinc-800/40 p-6 space-y-3'>
            <div className='h-6 bg-gray-200 dark:bg-zinc-700 rounded w-24' />
            <div className='space-y-2'>
              <div className='h-4 bg-gray-200 dark:bg-zinc-700 rounded w-full' />
              <div className='h-4 bg-gray-200 dark:bg-zinc-700 rounded w-5/6' />
              <div className='h-4 bg-gray-200 dark:bg-zinc-700 rounded w-4/5' />
            </div>
          </div>
        </div>
      </div>

      {/* Divider skeleton */}
      <div className='relative h-px my-8 bg-gradient-to-r from-transparent via-gray-300 dark:via-zinc-700 to-transparent overflow-hidden'>
        <div
          className='absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/25 to-transparent animate-pulse'
          style={{ animationDuration: '3s' }}
        />
      </div>

      {/* Clippings grid skeleton */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {new Array(6).fill(1).map((_, i) => (
          <div
            key={i}
            className='bg-slate-50/80 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-100/50 dark:border-slate-700/50 space-y-4'
          >
            <div className='h-6 bg-gray-200 dark:bg-zinc-700 rounded w-3/4' />
            <div className='h-px w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-zinc-700 to-transparent' />
            <div className='space-y-2'>
              <div className='h-4 bg-gray-200 dark:bg-zinc-700 rounded w-full' />
              <div className='h-4 bg-gray-200 dark:bg-zinc-700 rounded w-5/6' />
              <div className='h-4 bg-gray-200 dark:bg-zinc-700 rounded w-4/5' />
              <div className='h-4 bg-gray-200 dark:bg-zinc-700 rounded w-3/4' />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BookPageSkeleton
