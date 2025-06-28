import styles from './clipping.module.css'

type Props = {
  children: React.ReactNode
  content: React.ReactNode
  sidebar: React.ReactNode
  comments: React.ReactNode
}

function Layout(props: Props) {
  const { content, sidebar, comments } = props
  return (
    <div className={`${styles.clipping} anna-fade-in flex flex-col`}>
      <div className="with-slide-in w-full mt-4 lg:mt-24 mb-8">
        {/* Single card container for content and sidebar */}
        <div className="relative w-full rounded-3xl overflow-hidden">
          {/* Subtle texture overlay */}
          <div className='absolute inset-0 opacity-[0.008] dark:opacity-[0.012] pointer-events-none z-10'>
            <svg width="100%" height="100%">
              <pattern id="main-texture" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="currentColor" className='text-gray-900 dark:text-white' />
                <circle cx="6" cy="6" r="1" fill="currentColor" className='text-gray-900 dark:text-white' />
              </pattern>
              <rect width="100%" height="100%" fill="url(#main-texture)" />
            </svg>
          </div>

          {/* Main card with gradient background */}
          <div className='relative bg-gradient-to-br from-white/95 via-gray-50/90 to-blue-50/50 dark:from-zinc-900/95 dark:via-zinc-900/90 dark:to-blue-950/30 shadow-xl border border-gray-200/60 dark:border-zinc-800/50 backdrop-blur-md'>
            {/* Additional gradient overlay for depth */}
            <div className='absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-blue-400/[0.015] dark:to-blue-400/[0.025] pointer-events-none' />
            
            {/* Content wrapper with responsive grid */}
            <div className='relative z-10 grid grid-cols-1 lg:grid-cols-[1fr,380px] divide-y lg:divide-y-0 lg:divide-x divide-gray-200/50 dark:divide-zinc-800/40'>
              {/* Main content area */}
              <div className='p-6 lg:p-10'>
                {content}
              </div>
              
              {/* Sidebar area */}
              <div className='p-6 lg:p-8 bg-gradient-to-b from-transparent to-gray-50/50 dark:to-zinc-800/30'>
                {sidebar}
              </div>
            </div>
          </div>
        </div>
      </div>
      {comments}
    </div>
  )
}

export default Layout
