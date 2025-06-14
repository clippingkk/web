import React from 'react'
import Link from 'next/link'
import { Rss, BookOpen, BarChart3 } from 'lucide-react'
import { useTranslation } from '@/i18n' // Assuming server-side translation
import { ProfileQuery } from '@/schema/generated'
import { API_HOST } from '@/constants/config'
import UserName from '@/components/profile/user-name'
import ProfileEditor from './profile-editor'
import ProfileBindPhone from './bind-phone'
import WechatBindButton from './bind'
import PersonalityView from './personality'
import UserActions from './actions'

const CliApiToken = React.lazy(() => import('./cli-api'))

type ProfileDetailsProps = {
  profile: ProfileQuery['me']
  uid?: number
  isInMyPage: boolean
  year: number
}

const ProfileDetails = async ({ profile, uid, isInMyPage, year }: ProfileDetailsProps) => {
  const { t } = await useTranslation()

  return (
    <div className='px-4 sm:px-6 md:px-8 pt-20 pb-8'>
      {/* User identity section */}
      <div className='flex flex-wrap items-start gap-4'>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 flex-wrap'>
            <UserName
              name={profile.name}
              premiumEndAt={profile.premiumEndAt}
            />
            {profile.phone === '' && isInMyPage && (
              <ProfileBindPhone />
            )}
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
          <div className='flex items-center mt-2 text-gray-600 dark:text-gray-300'>
            <div className='flex items-center'>
              <BookOpen className='w-4 h-4 mr-1.5 flex-shrink-0' />
              <span className='text-sm font-medium'>
                {t('app.profile.collected', { count: profile.clippingsCount })}
              </span>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className='flex-shrink-0'>
          <UserActions isInMyPage={isInMyPage} profile={profile} />
        </div>
      </div>
      
      {/* Bio section */}
      <div className='mt-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm'>
        <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2'>Bio</h3>
        <div className='text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line prose prose-sm dark:prose-invert max-w-none'>
          {profile.bio || t('app.profile.noBio')}
        </div>
      </div>
      
      {/* Connect section */}
      <div className='mt-6'>
        <WechatBindButton profile={profile} isInMyPage={isInMyPage} uid={uid} />
      </div>
      
      {/* Feature cards */}
      <div className='mt-8 grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Link
          href={`/report/yearly?uid=${profile.id}&year=${year}`}
          className='group flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-500/90 to-blue-600/90 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
          title={t('app.profile.yearlyReportTip') ?? ''}
        >
          <div className='p-2.5 rounded-lg bg-white/25 backdrop-blur-sm'>
            <BarChart3 className='w-6 h-6' />
          </div>
          <div>
            <h3 className='font-semibold'>{t('app.profile.report.yearlyTitle')}</h3>
            <p className='text-sm text-white/80'>{t('app.profile.yearlyReportTip')}</p>
          </div>
        </Link>
        <a
          href={`${API_HOST}/api/rss/user/${profile.id}/clippings`}
          target='_blank'
          className='group flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-orange-500/90 to-orange-600/90 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
          rel="noreferrer"
        >
          <div className='p-2.5 rounded-lg bg-white/25 backdrop-blur-sm'>
            <Rss className='w-6 h-6' />
          </div>
          <div>
            <h3 className='font-semibold'>RSS Feed</h3>
            <p className='text-sm text-white/80'>{t('app.profile.rssTip')}</p>
          </div>
        </a>
      </div>
      
      {/* Personality section (only for profile owner) */}
      {isInMyPage && (
        <div className='mt-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm'>
          <PersonalityView uid={profile.id} domain={profile.domain} />
        </div>
      )}
    </div>
  )
}

export default ProfileDetails
