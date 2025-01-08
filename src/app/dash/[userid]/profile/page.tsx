import React from 'react'
import { ProfileQuery, ProfileQueryVariables, ProfileDocument } from '@/schema/generated'
import { generateMetadata as profileGenerateMetadata } from '@/components/og/og-with-user-profile'
import ProfilePageContent from './content'
import { Metadata } from 'next'
import { getApolloServerClient } from '@/services/apollo.server'
import { cookies } from 'next/headers'

type PageProps = {
  params: Promise<{ userid: string }>
  searchParams: Promise<{ with_profile_editor?: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
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
  const pathUid: string = (await props.params).userid
  const cs = await cookies()
  const myUid = cs.get('uid')?.value
  return (
    <ProfilePageContent
      targetUidOrDomain={(await props.params).userid}
      myUid={myUid ? parseInt(myUid) : undefined}
      withProfileEditor={(await props.searchParams).with_profile_editor}
    />
  )
}

export default Page
