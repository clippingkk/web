
type Props = {
  children: React.ReactNode
}

function Layout({ children }: Props) {
  return (
    <section className='page anna-fade-in'>
      <div className="w-full mt-4 lg:mt-24 mb-8">
        {/* Single elegant container for book content */}
        <div className="relative w-full rounded-3xl overflow-hidden">
          {/* Subtle texture overlay */}
          <div className='absolute inset-0 opacity-[0.008] dark:opacity-[0.012] pointer-events-none z-10'>
            <svg width="100%" height="100%">
              <pattern id="book-texture" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="currentColor" className='text-gray-900 dark:text-white' />
                <circle cx="6" cy="6" r="1" fill="currentColor" className='text-gray-900 dark:text-white' />
              </pattern>
              <rect width="100%" height="100%" fill="url(#book-texture)" />
            </svg>
          </div>

          {/* Main card with gradient background */}
          <div className='relative bg-gradient-to-br from-white/95 via-gray-50/90 to-blue-50/50 dark:from-zinc-900/95 dark:via-zinc-900/90 dark:to-blue-950/30 shadow-xl border border-gray-200/60 dark:border-zinc-800/50 backdrop-blur-md'>
            {/* Additional gradient overlay for depth */}
            <div className='absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-blue-400/[0.015] dark:to-blue-400/[0.025] pointer-events-none' />
            
            {/* Content */}
            <div className='relative z-10 p-6 lg:p-10'>
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
export default Layout
