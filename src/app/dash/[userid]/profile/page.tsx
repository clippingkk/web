import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { generateMetadata as profileGenerateMetadata } from '@/components/og/og-with-user-profile'
import PersonalActivity from '@/components/profile/activity'
import ProfileTabs from '@/components/profile-tabs/profile-tabs'
import { COOKIE_TOKEN_KEY, USER_ID_KEY } from '@/constants/storage'
import { useTranslation } from '@/i18n'
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

  console.log('withProfileEditor', withProfileEditor)
  return (
    <section className='w-full'>
      {/* Main profile section */}
      <div className='anna-fade-in'>
        <ProfilePageContent profile={profile.me} myUid={myUid} />

        {/* Enhanced Activity chart section */}
        <div className='relative group/activity mt-8 w-full'>
          {/* Activity section glow */}
          <div className='absolute -inset-1 bg-gradient-to-r from-green-400/20 via-blue-400/20 to-purple-400/20 rounded-3xl blur opacity-40 group-hover/activity:opacity-60 transition-opacity duration-500'></div>

          <div className='relative overflow-hidden rounded-3xl border border-white/40 dark:border-gray-700/40 bg-gradient-to-br from-white/80 via-white/70 to-white/60 dark:from-gray-900/80 dark:via-gray-800/70 dark:to-gray-900/60 p-8 shadow-2xl backdrop-blur-xl'>
            {/* Subtle pattern overlay */}
            <div
              className='absolute inset-0 rounded-3xl opacity-20 dark:opacity-10'
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
                backgroundSize: '20px 20px',
              }}
            ></div>

            <div className='relative'>
              <div className='mb-6 flex items-center gap-3'>
                <div className='relative'>
                  <div className='absolute -inset-1 bg-blue-400/30 rounded-lg blur'></div>
                  <div className='relative p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500'>
                    <svg
                      className='h-6 w-6 text-white'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                      />
                    </svg>
                  </div>
                </div>
                <h2 className='text-2xl font-bold text-gray-800 dark:text-gray-200'>
                  {t('app.profile.activity')}
                </h2>
              </div>
              <PersonalActivity data={profile.me.analysis.daily} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed content section */}
      <div className='pt-6'>
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
