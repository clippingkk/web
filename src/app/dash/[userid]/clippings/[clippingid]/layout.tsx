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

          {/* Main card with unified glass background */}
          <div className="relative rounded-3xl border border-white/40 bg-white/70 shadow-sm backdrop-blur-xl dark:border-slate-800/40 dark:bg-slate-900/70">
            {/* Subtle blue depth overlay */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-t from-transparent via-transparent to-blue-400/[0.02] dark:to-blue-400/[0.04]" />

            {/* Content wrapper with responsive grid */}
            <div className="relative z-10 grid grid-cols-1 divide-y divide-slate-200/50 lg:grid-cols-[1fr,380px] lg:divide-x lg:divide-y-0 dark:divide-slate-800/50">
              {/* Main content area */}
              <div className="p-6 lg:p-10">{content}</div>

              {/* Sidebar area */}
              <div className="bg-gradient-to-b from-transparent to-blue-50/40 p-6 lg:p-8 dark:to-blue-950/20">
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
