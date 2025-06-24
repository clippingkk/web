import { generateMetadata as profileGenerateMetadata } from '@/components/og/og-with-user-profile'
import PersonalActivity from '@/components/profile/activity'
import ProfileTabs from '@/components/profile-tabs/profile-tabs'
import { useTranslation } from '@/i18n'
import {
  ProfileDocument,
  ProfileQuery,
  ProfileQueryVariables,
} from '@/schema/generated'
import { doApolloServerQuery } from '@/services/apollo.server'
import { Metadata } from 'next'
import { cookies } from 'next/headers'
import ProfilePageContent from './content'

type PageProps = {
  params: Promise<{ userid: string }>
  searchParams: Promise<{ with_profile_editor?: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const pathUid: string = params.userid
  const uid = parseInt(pathUid)

  const profileResponse = await doApolloServerQuery<
    ProfileQuery,
    ProfileQueryVariables
  >({
    query: ProfileDocument,
    fetchPolicy: 'network-only',
    variables: {
      id: Number.isNaN(uid) ? -1 : uid,
      domain: Number.isNaN(uid) ? pathUid : null,
    },
  })
  return profileGenerateMetadata({
    profile: profileResponse.data.me,
  })
}

async function Page(props: PageProps) {
  const [params, searchParams, ck, { t }] = await Promise.all([
    props.params,
    props.searchParams,
    cookies(),
    useTranslation(),
  ])
  const withProfileEditor = searchParams.with_profile_editor
  const pathUid: string = params.userid
  const myUidStr = ck.get('uid')?.value
  const myUid = myUidStr ? parseInt(myUidStr) : undefined

  const tk = ck.get('token')?.value

  const headers: Record<string, string> = {}
  if (tk) {
    headers.Authorization = 'Bearer ' + tk
  }

  const isTargetUidType = !Number.isNaN(parseInt(pathUid))
  const { data: profile } = await doApolloServerQuery<
    ProfileQuery,
    ProfileQueryVariables
  >({
    query: ProfileDocument,
    variables: {
      id: isTargetUidType ? parseInt(pathUid) : undefined,
      domain: isTargetUidType ? undefined : pathUid,
    },
    context: {
      headers,
    },
  })

  console.log('withProfileEditor', withProfileEditor)
  return (
    <section className="w-full">
      {/* Main profile section */}
      <div className="anna-fade-in">
        <ProfilePageContent profile={profile.me} myUid={myUid} />

        {/* Activity chart section */}
        <div className="mt-8 w-full overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white/70 via-white/60 to-white/40 p-6 shadow-xl backdrop-blur-lg dark:border-gray-700 dark:from-gray-900/70 dark:via-gray-800/60 dark:to-gray-900/40">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-medium text-gray-800 dark:text-gray-200">
            <svg
              className="h-5 w-5 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            {t('app.profile.activity')}
          </h2>
          <PersonalActivity data={profile.me.analysis.daily} />
        </div>

      </div>

      {/* Tabbed content section */}
      <div className="pt-6">
        {myUid && (
          <ProfileTabs 
            uid={profile.me.id}
            userDomain={profile.me.domain}
            profile={profile.me}
          />
        )}
      </div>
    </section>
  )
}

export default Page
