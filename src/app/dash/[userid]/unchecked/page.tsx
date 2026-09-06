import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import {
  ProfileDocument,
  type ProfileQuery,
  type ProfileQueryVariables,
} from '@/gql/graphql'
import { currentUserId } from '@/server/gate/current'
import { getApolloServerClient } from '@/services/apollo.server'

import UncheckedPageContent from './content'

type Props = {
  params: Promise<{ userid: string }>
}

async function UncheckedPage(props: Props) {
  const [params] = await Promise.all([props.params, cookies()])
  const { userid } = params
  const myUid = (await currentUserId())?.toString()

  if (!myUid) {
    return redirect(`/dash/${userid}/profile`)
  }

  const myUidInt = myUid ? parseInt(myUid, 10) : undefined

  const apolloClient = await getApolloServerClient()
  const { data: profileResponse } = await apolloClient.query<
    ProfileQuery,
    ProfileQueryVariables
  >({
    query: ProfileDocument,
    fetchPolicy: 'network-only',
    variables: {
      id: myUidInt,
    },
    context: {
      headers: {},
    },
  })
  return <UncheckedPageContent profile={profileResponse!.me} />
}

export default UncheckedPage
