import React from 'react'
import AuthV3Content from './content'
import { Metadata } from 'next'
import { generateMetadata as authGenerateMetadata } from '../../../components/og/og-with-auth'

export function generateMetadata(): Metadata {
  return authGenerateMetadata('auth/auth-v4')
}

function Page() {
  return (
    <AuthV3Content />
  )
}

export default Page
