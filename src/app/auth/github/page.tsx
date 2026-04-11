import type { Metadata } from 'next'

import { generateMetadata as authGenerateMetadata } from '../../../components/og/og-with-auth'
import AuthPageShell from '../auth-page-shell'
import { fetchPublicDataWithBooks } from '../public-data-prefetch'
import GithubOAuthContent from './content'

export function generateMetadata(): Metadata {
  return authGenerateMetadata('auth/github')
}

type PageProps = {
  searchParams: Promise<{
    code: string
  }>
}

async function Page(props: PageProps) {
  const data = await fetchPublicDataWithBooks()
  const { code } = await props.searchParams

  return (
    <AuthPageShell
      data={data}
      innerClassName="bg-opacity-5 flex h-full w-full items-center justify-center bg-slate-200 backdrop-blur-xs"
    >
      {code ? (
        <GithubOAuthContent code={code} />
      ) : (
        <div className="text-7xl">No code provided</div>
      )}
    </AuthPageShell>
  )
}

export default Page
