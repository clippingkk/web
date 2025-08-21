import type { Metadata } from 'next'
import CanceledPageContent from './content'

export const metadata: Metadata = {
  title: 'Payemnt canceled',
}

function CanceledPage() {
  return (
    <div className=' w-full h-full flex flex-col items-center justify-center dark:text-gray-100 pt-20'>
      <CanceledPageContent />
    </div>
  )
}

export default CanceledPage
