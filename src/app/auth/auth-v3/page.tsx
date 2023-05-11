import React from 'react'
import AuthV3Content from './content'
import { Metadata } from 'next'

type PageProps = {
}

export const metadata: Metadata = {
  title: 'Login by...'
  // TODO: 
        // <OGWithAuth urlPath='auth/auth-v3' />
}
function Page(props: PageProps) {
  return (
    <AuthV3Content />
  )
}

export default Page
