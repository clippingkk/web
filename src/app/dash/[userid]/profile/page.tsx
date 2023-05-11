import React from 'react'
import { ProfileQuery, ProfileQueryVariables, ProfileDocument } from '../../../../schema/generated'
import { client } from '../../../../services/ajax'
import ProfilePageContent from './content'

type PageProps = {
  params: { userid: string }
  searchParams: { with_profile_editor?: string }
}

async function Page(props: PageProps) {
  const pathUid: string = props.params.userid
  const uid = parseInt(pathUid)
  const profileResponse = await client.query<ProfileQuery, ProfileQueryVariables>({
    query: ProfileDocument,
    fetchPolicy: 'network-only',
    variables: {
      id: Number.isNaN(uid) ? -1 : uid,
      domain: Number.isNaN(uid) ? pathUid : null
    },
  })
  return (
    <ProfilePageContent
      userid={props.params.userid}
      profileData={profileResponse.data}
      withProfileEditor={props.searchParams.with_profile_editor}
    />
  )
}

export default Page
