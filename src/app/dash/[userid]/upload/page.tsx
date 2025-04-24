import React from 'react'
import UploaderPageContent from './content'
import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getApolloServerClient } from '@/services/apollo.server'
import { ProfileQuery, ProfileQueryVariables, ProfileDocument } from '@/schema/generated'

type Props = {
  params: Promise<{ userid: string }>
}

export const metadata: Metadata = {
  title: '同步用户书摘',
}

async function Page(props: Props) {
  const [params, ck] = await Promise.all([props.params, cookies()])
  const { userid } = params
  const myUid = ck.get('uid')?.value

  if (!myUid) {
    return redirect(`/dash/${userid}/profile`)
  }

  const myUidInt = myUid ? parseInt(myUid) : undefined

  const apolloClient = getApolloServerClient()
  const { data: profileResponse } = await apolloClient.query<ProfileQuery, ProfileQueryVariables>({
    query: ProfileDocument,
    fetchPolicy: 'network-only',
    variables: {
      id: myUidInt
    },
    context: {
      headers: {
        'Authorization': 'Bearer ' + ck.get('token')?.value
      },
    }
  })
  return (
    <UploaderPageContent profile={profileResponse.me} />
  )
}

export default Page
