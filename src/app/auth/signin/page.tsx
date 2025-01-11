import { Metadata } from 'next'
import React from 'react'
import SigninPageContent from './content'
import { generateMetadata as authGenerateMetadata } from '@/components/og/og-with-auth'

export function generateMetadata(): Metadata {
  return authGenerateMetadata('auth/signin')
}

function Page() {
  return (
    <SigninPageContent />
  )
}

export default Page
