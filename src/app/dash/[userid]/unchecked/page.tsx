import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { COOKIE_TOKEN_KEY, USER_ID_KEY } from '@/constants/storage'
import {
  ProfileDocument,
  type ProfileQuery,
  type ProfileQueryVariables,
} from '@/schema/generated'
import { getApolloServerClient } from '@/services/apollo.server'
import UncheckedPageContent from './content'

type Props = {
  params: Promise<{ userid: string }>
}

async function UncheckedPage(props: Props) {
  const [params, ck] = await Promise.all([props.params, cookies()])
  const { userid } = params
  const myUid = ck.get(USER_ID_KEY)?.value

  if (!myUid) {
    return redirect(`/dash/${userid}/profile`)
  }

  const myUidInt = myUid ? parseInt(myUid, 10) : undefined

  const apolloClient = getApolloServerClient()
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
      headers: {
        Authorization: `Bearer ${ck.get(COOKIE_TOKEN_KEY)?.value}`,
      },
    },
  })
  return <UncheckedPageContent profile={profileResponse.me} />
}

export default UncheckedPage
