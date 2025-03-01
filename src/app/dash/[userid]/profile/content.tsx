import React from 'react'
import WechatBindButton from './bind'
import { useTranslation } from '@/i18n'
import ProfileEditor from './profile-editor'
import ProfileBindPhone from './bind-phone'
import { API_HOST } from '@/constants/config'
import Link from 'next/link'
import { ProfileQuery  } from '@/schema/generated'
import UserName from '@/components/profile/user-name'
import PersonalityView from './personality'
import PageTrack from '@/components/track/page-track'
import AvatarSection from './avatar-section'
import UserActions from './actions'
import { Rss, BookOpen, BarChart3 } from 'lucide-react'

const CliApiToken = React.lazy(() => import('./cli-api'))

type ProfilePageContentProps = {
  myUid?: number
  profile: ProfileQuery['me']
}

async function ProfilePageContent(props: ProfilePageContentProps) {
  const { profile } = props
  const { myUid: uid } = props

  const { t } = await useTranslation()

  const year = (new Date()).getFullYear() - ((new Date()).getMonth() > 6 ? 0 : 1)

  const isInMyPage = uid === profile.id

  return (
    <div className='w-full flex flex-col items-center justify-center mt-4'>
      <PageTrack page='profile' params={{userid: profile.id}} />
      
      {/* Profile card with gradient background and blur effect */}
      <div className='w-full rounded-2xl overflow-hidden backdrop-blur-lg bg-gradient-to-br from-white/70 via-white/60 to-white/40 dark:from-gray-900/70 dark:via-gray-800/60 dark:to-gray-900/40 shadow-xl border border-gray-200 dark:border-gray-700'>
        
        {/* Header section with avatar and basic info */}
        <div className='relative w-full h-40 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700'>
          <div className='absolute -bottom-16 left-8 z-10'>
            <AvatarSection profile={profile} uid={uid} isInMyPage={isInMyPage} />
          </div>
        </div>
        
        {/* Main content area */}
        <div className='px-8 pt-20 pb-8'>
          {/* User identity section */}
          <div className='flex flex-wrap items-center gap-3'>
            <div className='flex-1'>
              <div className='flex items-center gap-2'>
                <UserName
                  name={profile.name}
                  premiumEndAt={profile.premiumEndAt}
                />
                {profile.phone === '' && isInMyPage && (
                  <ProfileBindPhone />
                )}
                {isInMyPage && (
                  <ProfileEditor
                    uid={uid}
                    bio={profile.bio}
                    withNameChange={profile.name.startsWith('user.')}
                    domain={profile.domain}
                  />
                )}
                <CliApiToken />
              </div>
              
              {/* Stats section */}
              <div className='flex items-center mt-2 text-gray-600 dark:text-gray-300'>
                <div className='flex items-center'>
                  <BookOpen className='w-4 h-4 mr-1.5' />
                  <span className='text-sm font-medium'>
                    {t('app.profile.collected', { count: profile.clippingsCount })}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Action buttons for non-owner */}
            <UserActions isInMyPage={isInMyPage} profile={profile} />
          </div>
          
          {/* Bio section */}
          <div className='mt-6 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-100 dark:border-gray-700'>
            <h3 className='text-lg font-medium text-gray-800 dark:text-gray-200 mb-2'>Bio</h3>
            <div className='text-gray-600 dark:text-gray-300 whitespace-pre-line'>
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
              className='group flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-500/80 to-blue-600/80 hover:from-blue-600/90 hover:to-blue-700/90 text-white transition-all duration-300 shadow-md hover:shadow-lg'
              title={t('app.profile.yearlyReportTip') ?? ''}
            >
              <div className='p-2 rounded-lg bg-white/20 backdrop-blur-md'>
                <BarChart3 className='w-6 h-6' />
              </div>
              <div>
                <h3 className='font-medium'>{t('app.profile.report.yearlyTitle')}</h3>
                <p className='text-sm text-white/80'>{t('app.profile.yearlyReportTip')}</p>
              </div>
            </Link>
            <a
              href={`${API_HOST}/api/rss/user/${profile.id}/clippings`}
              target='_blank'
              className='group flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-orange-500/80 to-orange-600/80 hover:from-orange-600/90 hover:to-orange-700/90 text-white transition-all duration-300 shadow-md hover:shadow-lg'
              rel="noreferrer"
            >
              <div className='p-2 rounded-lg bg-white/20 backdrop-blur-md'>
                <Rss className='w-6 h-6' />
              </div>
              <div>
                <h3 className='font-medium'>RSS Feed</h3>
                <p className='text-sm text-white/80'>{t('app.profile.rssTip')}</p>
              </div>
            </a>
          </div>
          
          {/* Personality section (only for profile owner) */}
          {isInMyPage && (
            <div className='mt-8 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-100 dark:border-gray-700'>
              <PersonalityView uid={profile.id} domain={profile.domain} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePageContent
