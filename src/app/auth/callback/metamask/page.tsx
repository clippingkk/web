import type { Metadata } from 'next'
import { generateMetadata as authGenerateMetadata } from '@/components/og/og-with-auth'
import AuthCallbackMetamask from './content'

export function generateMetadata(): Metadata {
  return authGenerateMetadata('auth/callback/metamask')
}

type AppleCallbackPageProps = {
  searchParams: Promise<{ a: string; s: string; t: string }>
}

async function MetamaskPage(props: AppleCallbackPageProps) {
  const { a: address, s: signature, t: text } = await props.searchParams
  return (
    <AuthCallbackMetamask address={address} signature={signature} text={text} />
  )
}

export default MetamaskPage
