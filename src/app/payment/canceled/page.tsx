import type { Metadata } from 'next'

import DecorBlobs from '@/components/ui/decor-blobs/decor-blobs'
import Surface from '@/components/ui/surface/surface'

import CanceledPageContent from './content'

export const metadata: Metadata = {
  title: 'Payment canceled',
}

function CanceledPage() {
  return (
    <div className="anna-page-container relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-10">
      <DecorBlobs tone="danger" />
      <Surface
        variant="elevated"
        className="with-slide-in relative z-10 w-full max-w-xl p-8 md:p-12"
      >
        <CanceledPageContent />
      </Surface>
    </div>
  )
}

export default CanceledPage
