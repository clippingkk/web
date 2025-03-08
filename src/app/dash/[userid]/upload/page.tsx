import React from 'react'
import UploaderPageContent from './content'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '同步用户书摘',
}

function Page() {
  return (
    <UploaderPageContent />
  )
}

export default Page
