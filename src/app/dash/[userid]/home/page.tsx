import React from 'react'
import HomePageContent from './content'
import { generateMetadata as profileGenerateMetadata } from '../../../../components/og/og-with-user-profile'
import { Metadata } from 'next'
import { ProfileQuery, ProfileQueryVariables, ProfileDocument } from '../../../../schema/generated'
import { getApolloServerClient } from '../../../../services/apollo.server'
import { cookies } from 'next/headers'

type PageProps = {
  params: { userid: string }
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const pathUid: string = props.params.userid
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
  const { userid } = props.params
  const cs = cookies()
  const myUid = cs.get('uid')?.value

  return (
    <HomePageContent userid={userid} myUid={myUid ? parseInt(myUid) : undefined} />
  )
}

export default Page
