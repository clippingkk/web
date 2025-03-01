import React from 'react'
import { ProfileQuery, ProfileQueryVariables, ProfileDocument } from '@/schema/generated'
import { generateMetadata as profileGenerateMetadata } from '@/components/og/og-with-user-profile'
import ProfilePageContent from './content'
import { useTranslation } from '@/i18n'
import { Metadata } from 'next'
import { getApolloServerClient } from '@/services/apollo.server'
import { cookies } from 'next/headers'
import PersonalActivity from '@/components/profile/activity'
import ClippingList from './clipping-list'
import { BookOpen } from 'lucide-react'

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
    <section className="w-full">
      {/* Main profile section */}
      <div className="anna-fade-in">
        <ProfilePageContent profile={profile.me} myUid={myUid} />
        
        {/* Activity chart section */}
        <div className="mt-8 w-full rounded-2xl overflow-hidden backdrop-blur-lg bg-gradient-to-br from-white/70 via-white/60 to-white/40 dark:from-gray-900/70 dark:via-gray-800/60 dark:to-gray-900/40 shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {t('app.profile.activity')}
          </h2>
          <PersonalActivity
            data={profile.me.analysis.daily}
          />
        </div>
      </div>

      {/* Recent clippings section */}
      <div className="pt-6">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent flex-grow"></div>
          <h2 className="text-xl font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            {t('app.profile.recents')}
          </h2>
          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent flex-grow"></div>
        </div>

        {myUid && (
          <div className="backdrop-blur-md rounded-2xl shadow-lg">
            <ClippingList uid={profile.me.id} userDomain={profile.me.domain} />
          </div>
        )}
      </div>
    </section>
  )
}

export default Page
