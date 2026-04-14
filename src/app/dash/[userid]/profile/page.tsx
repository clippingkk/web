import type { Metadata } from 'next'
import { cookies } from 'next/headers'

import { generateMetadata as profileGenerateMetadata } from '@/components/og/og-with-user-profile'
import ProfileTabs from '@/components/profile-tabs/profile-tabs'
import PersonalActivity from '@/components/profile/activity'
import { COOKIE_TOKEN_KEY, USER_ID_KEY } from '@/constants/storage'
import { getTranslation } from '@/i18n'
import {
  ProfileDocument,
  type ProfileQuery,
  type ProfileQueryVariables,
} from '@/schema/generated'
import { doApolloServerQuery } from '@/services/apollo.server'

import ProfilePageContent from './content'

type PageProps = {
  params: Promise<{ userid: string }>
  searchParams: Promise<{ with_profile_editor?: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const pathUid: string = params.userid
  const uid = parseInt(pathUid, 10)

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
    profile: profileResponse.data!.me,
  })
}

async function Page(props: PageProps) {
  const [params, , ck, { t }] = await Promise.all([
    props.params,
    props.searchParams,
    cookies(),
    getTranslation(),
  ])
  const pathUid: string = params.userid
  const myUidStr = ck.get(USER_ID_KEY)?.value
  const myUid = myUidStr ? parseInt(myUidStr, 10) : undefined

  const tk = ck.get(COOKIE_TOKEN_KEY)?.value

  const headers: Record<string, string> = {}
  if (tk) {
    headers.Authorization = `Bearer ${tk}`
  }

  const isTargetUidType = !Number.isNaN(parseInt(pathUid, 10))
  const { data: profile } = await doApolloServerQuery<
    ProfileQuery,
    ProfileQueryVariables
  >({
    query: ProfileDocument,
    variables: {
      id: isTargetUidType ? parseInt(pathUid, 10) : undefined,
      domain: isTargetUidType ? undefined : pathUid,
    },
    context: {
      headers,
    },
  })

  return (
    <section className="w-full">
      {/* Main profile section */}
      <div className="anna-fade-in">
        <ProfilePageContent profile={profile.me} myUid={myUid} />

        {/* Activity chart section */}
        <div className="group/activity relative mt-8 w-full">
          {/* Subtle blue-toned glow behind the surface */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-sky-400/20 opacity-40 blur transition-opacity duration-500 group-hover/activity:opacity-60" />

          <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/70 p-8 shadow-sm backdrop-blur-xl dark:border-slate-800/40 dark:bg-slate-900/70">
            <div
              className="pointer-events-none absolute inset-0 rounded-3xl opacity-20 dark:opacity-10"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, rgba(59,130,246,0.18) 1px, transparent 0)',
                backgroundSize: '20px 20px',
              }}
            />

            <div className="relative">
              <div className="mb-6 flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/10 text-blue-500 ring-1 ring-blue-400/20 dark:bg-blue-400/15 dark:text-blue-300">
                  <svg
                    className="h-5 w-5"
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
                </span>
                <h2 className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 bg-clip-text text-2xl font-semibold tracking-tight text-transparent">
                  {t('app.profile.activity')}
                </h2>
              </div>
              <PersonalActivity data={profile.me.analysis.daily} />
            </div>
          </div>
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
