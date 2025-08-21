import type { Metadata } from 'next'
import { generateMetadata as authGenerateMetadata } from '../../../components/og/og-with-auth'
import AuthPhoneContent from './content'

export function generateMetadata(): Metadata {
  return authGenerateMetadata('auth/phone')
}

function Page() {
  return <AuthPhoneContent />
}

export default Page
