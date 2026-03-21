import type { Metadata } from 'next'

import CanceledPageContent from './content'

export const metadata: Metadata = {
  title: 'Payemnt canceled',
}

function CanceledPage() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center pt-20 dark:text-gray-100">
      <CanceledPageContent />
    </div>
  )
}

export default CanceledPage
