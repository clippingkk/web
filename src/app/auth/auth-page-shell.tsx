import { HydrationBoundary } from '@tanstack/react-query'
import type React from 'react'

import GalleryBackgroundView from '@/components/galleryBackgroundView'

import type { PublicDataWithBooks } from './public-data-prefetch'

type AuthPageShellProps = {
  data: PublicDataWithBooks
  children: React.ReactNode
  innerClassName?: string
}

const radialGradientStyle: React.CSSProperties = {
  '--start-color': 'oklch(45.08% 0.133 252.21 / 7.28%)',
  '--end-color': 'oklch(45.08% 0.133 252.21 / 77.28%)',
  backgroundImage:
    'radial-gradient(var(--start-color) 0%, var(--end-color) 100%)',
} as React.CSSProperties

function AuthPageShell({ data, children, innerClassName }: AuthPageShellProps) {
  return (
    <HydrationBoundary state={data.dehydratedState}>
      <div className="relative h-full w-full bg-slate-100 dark:bg-slate-900">
        <GalleryBackgroundView publicData={data.publicData} />
        <div
          className="with-fade-in absolute top-0 right-0 bottom-0 left-0 flex h-full w-full flex-col items-center justify-center"
          style={radialGradientStyle}
        >
          <div
            className={
              innerClassName ??
              'flex h-full w-full items-center justify-center bg-slate-200/5 backdrop-blur-xs'
            }
          >
            {children}
          </div>
        </div>
      </div>
    </HydrationBoundary>
  )
}

export default AuthPageShell
