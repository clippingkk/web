import { ScrollToTopOnLoad } from '@/components/scroll-to-top-on-load'

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
      <ScrollToTopOnLoad />
      <div className="with-slide-in mt-4 mb-8 w-full lg:mt-24">
        {/* Single card container for content and sidebar */}
        <div className="relative w-full overflow-hidden rounded-3xl">
          {/* Subtle texture overlay */}
          <div className="pointer-events-none absolute inset-0 z-10 opacity-[0.008] dark:opacity-[0.012]">
            <svg width="100%" height="100%">
              <pattern
                id="main-texture"
                x="0"
                y="0"
                width="8"
                height="8"
                patternUnits="userSpaceOnUse"
              >
                <circle
                  cx="2"
                  cy="2"
                  r="1"
                  fill="currentColor"
                  className="text-gray-900 dark:text-white"
                />
                <circle
                  cx="6"
                  cy="6"
                  r="1"
                  fill="currentColor"
                  className="text-gray-900 dark:text-white"
                />
              </pattern>
              <rect width="100%" height="100%" fill="url(#main-texture)" />
            </svg>
          </div>

          {/* Main card with gradient background */}
          <div className="relative border border-gray-200/60 bg-gradient-to-br from-white/95 via-gray-50/90 to-blue-50/50 shadow-xl backdrop-blur-md dark:border-zinc-800/50 dark:from-zinc-900/95 dark:via-zinc-900/90 dark:to-blue-950/30">
            {/* Additional gradient overlay for depth */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-blue-400/[0.015] dark:to-blue-400/[0.025]" />

            {/* Content wrapper with responsive grid */}
            <div className="relative z-10 grid grid-cols-1 divide-y divide-gray-200/50 lg:grid-cols-[1fr,380px] lg:divide-x lg:divide-y-0 dark:divide-zinc-800/40">
              {/* Main content area */}
              <div className="p-6 lg:p-10">{content}</div>

              {/* Sidebar area */}
              <div className="bg-gradient-to-b from-transparent to-gray-50/50 p-6 lg:p-8 dark:to-zinc-800/30">
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
