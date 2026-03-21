import { MessageSquare } from 'lucide-react'
import type React from 'react'

import { getTranslation } from '@/i18n'

type Props = {
  children: React.ReactNode
}

async function Layout(props: Props) {
  const { children } = props
  const { t } = await getTranslation()
  return (
    <div className="mb-8 w-full">
      <div className="relative w-full overflow-hidden rounded-2xl">
        {/* Subtle texture overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.02]">
          <svg width="100%" height="100%">
            <pattern
              id="comments-texture"
              x="0"
              y="0"
              width="4"
              height="4"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="1"
                cy="1"
                r="0.5"
                fill="currentColor"
                className="text-gray-900 dark:text-white"
              />
            </pattern>
            <rect width="100%" height="100%" fill="url(#comments-texture)" />
          </svg>
        </div>

        {/* Main container with gradient background */}
        <div className="relative border border-gray-200/80 bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 shadow-sm backdrop-blur-sm dark:border-zinc-800/60 dark:from-zinc-900 dark:via-zinc-900/95 dark:to-blue-900/10">
          {/* Header with enhanced gradient */}
          <div className="relative border-b border-gray-200/60 bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/70 p-6 backdrop-blur-sm dark:border-zinc-800/50 dark:from-zinc-800/90 dark:via-blue-900/20 dark:to-indigo-900/10">
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-indigo-400/5 dark:from-blue-400/10 dark:to-indigo-400/10" />

            <div className="relative flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 p-2 shadow-sm shadow-blue-400/20 dark:from-blue-400 dark:to-blue-500 dark:shadow-blue-400/20">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-zinc-50">
                {t('app.clipping.comments.title')}
              </h3>
            </div>
          </div>

          <div className="relative space-y-6 p-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default Layout
