import React from 'react'
import { Metadata } from 'next'
import { generateMetadata as authGenerateMetadata } from '../../../components/og/og-with-auth'
import GithubOAuthContent from './content';

export function generateMetadata(): Metadata {
  return authGenerateMetadata('auth/github')
}

function Page() {
  return (
    <GithubOAuthContent />
  )
}

export default Page
