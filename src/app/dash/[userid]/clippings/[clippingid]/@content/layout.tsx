
type Props = {
  children: React.ReactNode
}

function Layout(props: Props) {
  const { children } = props
  return (
    <div className="relative w-full flex-3 rounded-xl overflow-hidden">
      {/* Subtle texture overlay */}
      <div className='absolute inset-0 opacity-[0.01] dark:opacity-[0.015] pointer-events-none z-10'>
        <svg width="100%" height="100%">
          <pattern id="content-texture" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill="currentColor" className='text-gray-900 dark:text-white' />
            <circle cx="4" cy="4" r="0.8" fill="currentColor" className='text-gray-900 dark:text-white' />
          </pattern>
          <rect width="100%" height="100%" fill="url(#content-texture)" />
        </svg>
      </div>

      {/* Main container with gradient background */}
      <div
        className='relative bg-gradient-to-br from-white/90 via-gray-50/80 to-blue-50/60 dark:from-slate-800/90 dark:via-slate-800/80 dark:to-blue-900/20 w-full p-4 lg:p-10 text-gray-900 dark:text-slate-200 shadow-sm border border-gray-200/40 dark:border-zinc-700/40'
        data-glow
        style={
          {
            '--base': 80,
            '--spread': 500,
            '--outer': 1,
            backdropFilter: 'blur(calc(var(--cardblur, 5) * 1px))',
          } as React.CSSProperties
        }
      >
        {/* Additional gradient overlay for depth */}
        <div className='absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-blue-400/[0.02] dark:to-blue-400/[0.04] pointer-events-none' />
        
        {/* Content */}
        <div className='relative z-10'>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Layout
