import React from 'react'
import WechatBindButton from './bind'
import { useTranslation } from '@/i18n'
import ProfileEditor from './profile-editor'
import ProfileBindPhone from './bind-phone'
import { API_HOST } from '@/constants/config'
import Link from 'next/link'
import CliApiToken from './cli-api'
import { ProfileQuery  } from '@/schema/generated'
import { Tooltip } from '@mantine/core'
import UserName from '@/components/profile/user-name'
import styles from './profile.module.css'
import PersonalityView from './personality'
import PageTrack from '@/components/track/page-track'
import AvatarSection from './avatar-section'
import UserActions from './actions'

type ProfilePageContentProps = {
  myUid?: number
  profile: ProfileQuery['me']
}

async function ProfilePageContent(props: ProfilePageContentProps) {
  const { profile } = props
  const { myUid: uid } = props

  const { t } = await useTranslation()

  // const chartData = useMemo(() => {
  //   const c = []
  //   for (let i = 12; i > 0; i--) {
  //     const date = dayjs().startOf('month').subtract(i, 'month').format('YYYY-MM')
  //     c.push({
  //       date,
  //       count: data.me.analysis.monthly.find(x => x.date === date)?.count ?? 0
  //     })
  //   }
  //   return c
  // }, [data.me.analysis.monthly])

  const year = (new Date()).getFullYear() - ((new Date()).getMonth() > 6 ? 0 : 1)

  const isInMyPage = uid === profile.id

  return (
    <div className='w-full flex items-center justify-center'>
      <PageTrack page='profile' params={{userid: profile.id}} />
      <AvatarSection profile={profile} uid={uid} isInMyPage={isInMyPage} />
      <div className={styles.info}>
        <div className='flex items-center'>
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
        <h5 className='text-lg text-gray-800 dark:text-gray-300'>
          {t('app.profile.collected', { count: profile.clippingsCount })}
        </h5>
        <div className='mb-4'>
          {profile.bio.split('\n').map((v, i) => (
            <p key={i}>{v}</p>
          ))}
        </div>
        <WechatBindButton profile={profile} isInMyPage={isInMyPage} uid={uid} />

        <UserActions isInMyPage={isInMyPage} profile={profile} />
        <Link
          href={`/report/yearly?uid=${profile.id}&year=${year}`}
          className='px-4 py-2 rounded bg-blue-400 text-gray-200 hover:bg-blue-600 mt-6'
          title={t('app.profile.yearlyReportTip') ?? ''}>
          {t('app.profile.report.yearlyTitle')}
        </Link>
        <Tooltip
          label={t('app.profile.rssTip') ?? ''}
          withArrow
          transitionProps={{ transition: 'pop', duration: 200 }}
        >
          <a
            href={`${API_HOST}/api/rss/user/${profile.id}/clippings`}
            target='_blank'
            className='ml-4 px-4 py-2 rounded hover:bg-blue-400'
            rel="noreferrer"
          >
            RSS
          </a>
        </Tooltip>
        {isInMyPage && (
          <PersonalityView uid={profile.id} domain={profile.domain} />
        )}
      </div>
    </div>
  )
}

export default ProfilePageContent
