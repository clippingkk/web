import { Metadata } from 'next'
import React from 'react'
import SigninPageContent from './content'

type PageProps = {
}

export const metadata: Metadata = {
  title: 'signin',
}

// <Head>
//   <title>登陆</title>
//   <OGWithAuth urlPath='auth/auth-v2' />
// </Head>

function Page(props: PageProps) {
  return (
    <SigninPageContent />
  )
}

export default Page
