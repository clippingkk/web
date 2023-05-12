import { Metadata } from 'next'
import React from 'react'
import SigninPageContent from './content'
import { generateMetadata as authGenerateMetadata } from '../../../components/og/og-with-auth'

type PageProps = {
}

export function generateMetadata(urlPath: string): Metadata {
  return authGenerateMetadata('auth/signin')
}

function Page(props: PageProps) {
  return (
    <SigninPageContent />
  )
}

export default Page
