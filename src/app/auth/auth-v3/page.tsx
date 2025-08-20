import type { Metadata } from 'next'
import React from 'react'
import { generateMetadata as authGenerateMetadata } from '../../../components/og/og-with-auth'
import AuthV3Content from './content'

export function generateMetadata(): Metadata {
  return authGenerateMetadata('auth/auth-v4')
}

function Page() {
  return <AuthV3Content />
}

export default Page
