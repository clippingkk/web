import { Metadata } from 'next'
import React from 'react'
import NewbiePageContent from './content'

type PageProps = {
}

export const metadata: Metadata = {
  title: 'Welcome to ClippingKK',
}

function Page(props: PageProps) {
  return (
    <NewbiePageContent />
  )
}

export default Page
