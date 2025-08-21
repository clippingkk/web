import type { Metadata } from 'next'
import { generateMetadata as authGenerateMetadata } from '@/components/og/og-with-auth'
import AuthCallbackApple from './content'

type AppleCallbackPageProps = {
  params: Promise<object>
  searchParams: Promise<{ i: string }>
}

export function generateMetadata(): Metadata {
  return authGenerateMetadata('auth/callback/apple')
}

async function AppleCallbackPage(props: AppleCallbackPageProps) {
  const idToken = (await props.searchParams).i
  return <AuthCallbackApple idToken={idToken} />
}

export default AppleCallbackPage
