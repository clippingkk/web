import type { Metadata } from 'next'

import { generateMetadata as authGenerateMetadata } from '@/components/og/og-with-auth'

import AuthPageShell from '../auth-page-shell'
import { fetchPublicDataWithBooks } from '../public-data-prefetch'
import ForceClean from './clean'
import AuthV4Content from './content'

export function generateMetadata(): Metadata {
  return authGenerateMetadata('auth/auth-v4')
}

async function Page() {
  const data = await fetchPublicDataWithBooks()
  return (
    <AuthPageShell data={data}>
      <ForceClean />
      <AuthV4Content />
    </AuthPageShell>
  )
}

export default Page
