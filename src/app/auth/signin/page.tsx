import type { Metadata } from 'next'
import React from 'react'
import { generateMetadata as authGenerateMetadata } from '@/components/og/og-with-auth'
import SigninPageContent from './content'

export function generateMetadata(): Metadata {
  return authGenerateMetadata('auth/signin')
}

function Page() {
  return <SigninPageContent />
}

export default Page
