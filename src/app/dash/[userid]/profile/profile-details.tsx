import { BarChart3, BookOpen, Rss } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import ProfileAnalytics from '@/components/profile/profile-analytics'
import UserName from '@/components/profile/user-name'
import { API_HOST } from '@/constants/config'
import { getTranslation } from '@/i18n'
import type { ProfileQuery } from '@/schema/generated'

import UserActions from './actions'
import WechatBindButton from './bind'
import ProfileBindPhone from './bind-phone'
import PersonalityView from './personality'
import ProfileEditor from './profile-editor'

const CliApiToken = React.lazy(() => import('./cli-api'))

type ProfileDetailsProps = {
  profile: ProfileQuery['me']
  uid?: number
  isInMyPage: boolean
  year: number
}

const ProfileDetails = async ({
  profile,
  uid,
  isInMyPage,
  year,
}: ProfileDetailsProps) => {
  const { t } = await getTranslation()

  return (
    <div className="px-4 pt-20 pb-8 sm:px-6 md:px-8">
      {/* User identity section */}
      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <UserName name={profile.name} premiumEndAt={profile.premiumEndAt} />
            {profile.phone === '' && isInMyPage && <ProfileBindPhone />}
            {isInMyPage && uid && (
              <ProfileEditor
                uid={uid}
                bio={profile.bio}
                withNameChange={profile.name.startsWith('user.')}
                domain={profile.domain}
              />
            )}
            <React.Suspense fallback={null}>
              <CliApiToken />
            </React.Suspense>
          </div>

          {/* Stats section */}
          <div className="mt-2 flex items-center text-gray-600 dark:text-gray-300">
            <div className="flex items-center">
              <BookOpen className="mr-1.5 h-4 w-4 flex-shrink-0" />
              <span className="text-sm font-medium">
                {t('app.profile.collected', { count: profile.clippingsCount })}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex-shrink-0">
          <UserActions isInMyPage={isInMyPage} profile={profile} />
        </div>
      </div>

      {/* Bio section */}
      <div className="mt-6 rounded-xl border border-white/40 bg-white/60 p-4 shadow-sm backdrop-blur-md dark:border-slate-800/40 dark:bg-slate-900/50">
        <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
          Bio
        </h3>
        <div className="prose prose-sm dark:prose-invert max-w-none text-sm whitespace-pre-line text-gray-700 dark:text-gray-300">
          {profile.bio || t('app.profile.noBio')}
        </div>
      </div>

      {/* Analytics section */}
      <ProfileAnalytics
        clippingsCount={profile.clippingsCount}
        booksCount={profile.booksCount}
        createdAt={profile.createdAt}
      />

      {/* Connect section */}
      <div className="mt-6">
        <WechatBindButton profile={profile} isInMyPage={isInMyPage} uid={uid} />
      </div>

      {/* Feature cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          href={`/report/yearly?uid=${profile.id}&year=${year}`}
          className="group flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-400 to-indigo-500 p-4 text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-500 hover:to-indigo-600 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          title={t('app.profile.yearlyReportTip') ?? ''}
        >
          <div className="rounded-lg bg-white/25 p-2.5 backdrop-blur-sm">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold">
              {t('app.profile.report.yearlyTitle')}
            </h3>
            <p className="text-sm text-white/80">
              {t('app.profile.yearlyReportTip')}
            </p>
          </div>
        </Link>
        <a
          href={`${API_HOST}/api/rss/user/${profile.id}/clippings`}
          target="_blank"
          className="group flex items-center gap-3 rounded-xl bg-gradient-to-r from-orange-400 to-amber-500 p-4 text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:from-orange-500 hover:to-amber-600 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          rel="noreferrer"
        >
          <div className="rounded-lg bg-white/25 p-2.5 backdrop-blur-sm">
            <Rss className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold">RSS Feed</h3>
            <p className="text-sm text-white/80">{t('app.profile.rssTip')}</p>
          </div>
        </a>
      </div>

      {/* Personality section (only for profile owner) */}
      {isInMyPage && (
        <div className="mt-8 rounded-xl border border-white/40 bg-white/60 p-4 shadow-sm backdrop-blur-md dark:border-slate-800/40 dark:bg-slate-900/50">
          <PersonalityView uid={profile.id} domain={profile.domain} />
        </div>
      )}
    </div>
  )
}

export default ProfileDetails
