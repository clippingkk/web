import React from 'react'
import UncheckedPageContent from './content'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getApolloServerClient } from '@/services/apollo.server'
import { ProfileQuery, ProfileQueryVariables, ProfileDocument } from '@/schema/generated'

type Props = {
  params: Promise<{ userid: string }>
}

async function UncheckedPage(props: Props) {
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
    <UncheckedPageContent profile={profileResponse.me} />
  )
}

export default UncheckedPage
