import React from 'react'
import UploaderPageContent from './content'
import { Metadata } from 'next'

type PageProps = {
}

export const metadata: Metadata = {
  title: '同步用户书摘',
}

function Page(props: PageProps) {
  return (
    <UploaderPageContent />
  )
}

export default Page
