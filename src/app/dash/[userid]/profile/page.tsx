import React from 'react'
import { ProfileQuery, ProfileQueryVariables, ProfileDocument } from '@/schema/generated'
import { generateMetadata as profileGenerateMetadata } from '@/components/og/og-with-user-profile'
import ProfilePageContent from './content'
import { useTranslation } from '@/i18n'
import { Metadata } from 'next'
import { getApolloServerClient } from '@/services/apollo.server'
import { cookies } from 'next/headers'
import { Divider, Text } from '@mantine/core'
import PersonalActivity from '@/components/profile/activity'
import ClippingList from './clipping-list'

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
  const [params, searchParams, ck] = await Promise.all([props.params, props.searchParams, cookies()])
  const withProfileEditor = searchParams.with_profile_editor
  const pathUid: string = params.userid
  const myUidStr = ck.get('uid')?.value
  const myUid = myUidStr ? parseInt(myUidStr) : undefined

  const ac = getApolloServerClient()

  const tk = ck.get('token')?.value

  const isTargetUidType = !Number.isNaN(parseInt(pathUid))
  const { data: profile } = await ac.query<ProfileQuery, ProfileQueryVariables>({
    query: ProfileDocument,
    variables: {
      id: isTargetUidType ? parseInt(pathUid) : undefined,
      domain: isTargetUidType ? undefined : pathUid
    },
    context: {
      headers: tk ? {
        Authorization: 'Bearer ' + tk
      } : null
    }
  })

  const { t } = await useTranslation()
  console.log('withProfileEditor', withProfileEditor)
  return (
    <section>
      <div className='flex rounded-sm items-center justify-center py-12 w-full mx-auto mt-20 anna-fade-in bg-gray-500 bg-opacity-50 backdrop-blur-sm shadow-2xl'>
        <div className='flex flex-col items-center justify-center w-full'>
          <ProfilePageContent profile={profile.me} myUid={myUid} />

          <div className='w-full mt-6'>
            <PersonalActivity
              data={profile.me.analysis.daily}
            />
          </div>
        </div>
      </div>

      <Divider
        label={<Text className=' dark:text-gray-100'>{t('app.profile.recents')}</Text>}
        labelPosition='center'
        className='my-8'
      />

      {myUid && (
        <ClippingList uid={profile.me.id} userDomain={profile.me.domain} />
      )}
    </section>
  )
}

export default Page
