import React from 'react'
import HomePageContent from './content'
import { generateMetadata as profileGenerateMetadata } from '@/components/og/og-with-user-profile'
import { Metadata } from 'next'
import { ProfileQuery, ProfileQueryVariables, ProfileDocument } from '@/schema/generated'
import { getApolloServerClient } from '@/services/apollo.server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getReactQueryClient } from '@/services/ajax'
import { WenquSearchResponse, wenquRequest } from '@/services/wenqu'
import { duration3Days } from '@/hooks/book'

type PageProps = {
  params: Promise<{ userid: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const pathUid: string = (await props.params).userid
  const uid = parseInt(pathUid)
  const client = getApolloServerClient()
  const profileResponse = await client.query<ProfileQuery, ProfileQueryVariables>({
    query: ProfileDocument,
    fetchPolicy: 'network-only',
    variables: {
      id: Number.isNaN(uid) ? -1 : uid,
      domain: Number.isNaN(uid) ? pathUid : null
    },
  })
  return profileGenerateMetadata({
    profile: profileResponse.data.me
  })
}

// the home page only available for myself
async function Page(props: PageProps) {
  const { userid } = (await props.params)
  const cs = await cookies()
  const myUid = cs.get('uid')?.value

  if (!myUid) {
    return redirect(`/dash/${userid}/profile`)
  }

  const myUidInt = myUid ? parseInt(myUid) : undefined

  const apolloClient = getApolloServerClient()
  const profileResponse = await apolloClient.query<ProfileQuery, ProfileQueryVariables>({
    query: ProfileDocument,
    fetchPolicy: 'network-only',
    variables: {
      id: myUidInt
    },
    context: {
      headers: {
        'Authorization': 'Bearer ' + cs.get('token')?.value
      },
    }
  })

  let firstBookId: string | undefined

  if (profileResponse.data.me.recents.length > 0) {
    firstBookId = profileResponse.data.me.recents[0].bookID
    if (firstBookId.length <= 3) {
      firstBookId = undefined
    }
    if (firstBookId) {
      await getReactQueryClient().prefetchQuery({
        queryKey: ['wenqu', 'books', firstBookId],
        queryFn: () => wenquRequest<WenquSearchResponse>(`/books/search?dbid=${firstBookId}`),
        staleTime: duration3Days,
        gcTime: duration3Days,
      })
    }
  }

  return (
    <HomePageContent userid={userid} myUid={myUidInt} firstBookId={firstBookId} />
  )
}

export default Page
