import { Metadata } from 'next'
import React from 'react'
import NewbiePageContent from './content'

export const metadata: Metadata = {
  title: 'Welcome to ClippingKK',
}

function Page() {
  return (
    <NewbiePageContent />
  )
}

export default Page
