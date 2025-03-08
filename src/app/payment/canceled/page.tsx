import React from 'react'
import CanceledPageContent from './content'
import { Metadata } from 'next'

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
