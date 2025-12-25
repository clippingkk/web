import type { Metadata } from 'next'
import { generateMetadata as authGenerateMetadata } from '@/components/og/og-with-auth'
/* METAMASK DISABLED
import AuthCallbackMetamask from './content'
*/

export function generateMetadata(): Metadata {
  return authGenerateMetadata('auth/callback/metamask')
}

type AppleCallbackPageProps = {
  searchParams: Promise<{ a: string; s: string; t: string }>
}

/* METAMASK DISABLED - This page is no longer functional */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function MetamaskPage(props: AppleCallbackPageProps) {
  /* METAMASK DISABLED
  const { a: address, s: signature, t: text } = await props.searchParams
  return (
    <AuthCallbackMetamask address={address} signature={signature} text={text} />
  )
  */
  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='text-center p-8'>
        <h1 className='text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4'>
          MetaMask Login Disabled
        </h1>
        <p className='text-gray-600 dark:text-gray-400'>
          MetaMask authentication is currently unavailable. Please use another login method.
        </p>
        <a
          href='/auth/auth-v4'
          className='mt-4 inline-block px-6 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors'
        >
          Back to Login
        </a>
      </div>
    </div>
  )
}

export default MetamaskPage
