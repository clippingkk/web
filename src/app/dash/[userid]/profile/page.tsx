import React from 'react'
import { ProfileQuery, ProfileQueryVariables, ProfileDocument } from '@/schema/generated'
import { generateMetadata as profileGenerateMetadata } from '@/components/og/og-with-user-profile'
import ProfilePageContent from './content'
import { Metadata } from 'next'
import { getApolloServerClient } from '@/services/apollo.server'
import { cookies } from 'next/headers'

type PageProps = {
  params: { userid: string }
  searchParams: { with_profile_editor?: string }
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const pathUid: string = params.userid
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

async function Page(props: PageProps) {
  const pathUid: string = props.params.userid
  const cs = cookies()
  const myUid = cs.get('uid')?.value
  return (
    <ProfilePageContent
      targetUidOrDomain={props.params.userid}
      myUid={myUid ? parseInt(myUid) : undefined}
      withProfileEditor={props.searchParams.with_profile_editor}
    />
  )
}

export default Page
