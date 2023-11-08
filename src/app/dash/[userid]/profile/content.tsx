'use client';
import React, { Suspense, useMemo, useState } from 'react'
import ClippingItem from '../../../../components/clipping-item/clipping-item';
import { usePageTrack, useTitle } from '../../../../hooks/tracke'
import WechatBindButton from './bind';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import Avatar from '../../../../components/avatar/avatar';
import ProfileEditor from './profile-editor'
import { useSelector } from 'react-redux'
import { TGlobalStore } from '../../../../store'
import MasonryContainer from '../../../../components/masonry-container'
import ProfileBindPhone from './bind-phone'
import { IN_APP_CHANNEL } from '../../../../services/channel'
import { API_HOST } from '../../../../constants/config'
import { toast } from 'react-hot-toast'
import Link from 'next/link';
import OGWithUserProfile from '../../../../components/og/og-with-user-profile';
import CliApiToken from './cli-api';
import AvatarPicker from '../../../../components/profile/avatar-picker';
import PersonalActivity from '../../../../components/profile/activity';
import { ProfileQuery, useFollowUserMutation, useUnfollowUserMutation, useUpdateProfileMutation } from '../../../../schema/generated';
import { Divider, Text } from '@mantine/core';
import UserName from '../../../../components/profile/user-name';
import styles from './profile.module.css'
import { Masonry } from 'masonic';
import ClippingList from './clipping-list';
import Loading from '../../../loading';

type ProfilePageContentProps = {
  userid: string
  profileData: ProfileQuery
  withProfileEditor?: string
}

function ProfilePageContent(props: ProfilePageContentProps) {
  // 优先使用本地数据，服务端数据只是为了 seo
  const data = props.profileData

  const [isPickingAvatar, setIsPickingAvatar] = useState(false)

  const [doFollow, { loading: followLoading }] = useFollowUserMutation()
  const [doUnfollow, { loading: unfollowLoading }] = useUnfollowUserMutation()

  const [doUpdate, { client: apolloClient }] = useUpdateProfileMutation()

  const uid = useSelector<TGlobalStore, number>(s => s.user.profile.id)
  usePageTrack('profile', {
    userId: data.me.id
  })

  useTitle(data.me.name)
  const { t } = useTranslation()

  const chartData = useMemo(() => {
    const c = []
    for (let i = 12; i > 0; i--) {
      const date = dayjs().startOf('month').subtract(i, 'month').format('YYYY-MM')
      c.push({
        date,
        count: data.me.analysis.monthly.find(x => x.date === date)?.count ?? 0
      })
    }
    return c
  }, [data.me.analysis.monthly])

  const year = (new Date()).getFullYear() - ((new Date()).getMonth() > 6 ? 0 : 1)

  const isInMyPage = uid === data.me.id

  const isWechatBindingVisible = useMemo(() => {
    if (uid === 0) {
      return false
    }

    if (!isInMyPage) {
      return false
    }
    return !!data.me.wechatOpenid
  }, [data, uid, isInMyPage])

  return (
    <section>
      <div className='flex rounded items-center justify-center py-12 w-full mx-auto mt-20 anna-fade-in bg-gray-500 bg-opacity-50 backdrop-blur shadow-2xl'>
        <div className='flex flex-col items-center justify-center w-full'>
          <div className='w-full flex items-center justify-center'>
            <Avatar
              img={data.me.avatar ?? ''}
              name={data?.me.name}
              editable={uid === data.me.id}
              className='w-16 h-16 mr-12 lg:w-32 lg:h-32'
              onClick={() => setIsPickingAvatar(true)}
            />
            <div className={styles.info}>
              <div className='flex items-center'>
                <UserName
                  name={data.me.name}
                  premiumEndAt={data.me.premiumEndAt}
                />
                {data?.me.phone === '' && isInMyPage && (
                  <ProfileBindPhone />
                )}
                {uid === data?.me.id && (
                  <ProfileEditor
                    uid={uid}
                    bio={data.me.bio}
                    withNameChange={data.me.name.startsWith('user.')}
                    domain={data.me.domain}
                  />
                )}
                <CliApiToken />
              </div>
              <h5 className='text-lg text-gray-800 dark:text-gray-300'>
                {t('app.profile.collected', { count: data?.me.clippingsCount })}
              </h5>
              <div className='mb-4'>
                {data?.me.bio.split('\n').map((v, i) => (
                  <p key={i}>{v}</p>
                ))}
              </div>
              {isWechatBindingVisible && (
                <WechatBindButton />
              )}
              {!isInMyPage && (
                <button
                  className='px-4 py-2 rounded bg-blue-400 text-gray-200 hover:bg-blue-600 mt-6 mr-4'
                  title={t(`app.profile.fans.${data?.me.isFan ? 'un' : ''}follow`) ?? ''}
                  disabled={followLoading || unfollowLoading}
                  onClick={() => {
                    if (followLoading || unfollowLoading) {
                      return
                    }
                    const params = { targetUserID: data.me.id }
                    let mutationJob: Promise<any>
                    if (data?.me.isFan) {
                      mutationJob = doUnfollow({
                        variables: params
                      })
                    } else {
                      mutationJob = doFollow({
                        variables: params
                      })
                    }
                    mutationJob.then(() => {
                      toast.success(t('app.common.done'))
                    }).catch(err => {
                      toast.error(err.toString())
                    })
                  }}
                >
                  {t(`app.profile.fans.${data?.me.isFan ? 'un' : ''}follow`)}
                </button>
              )}

              <Link
                href={`/report/yearly?uid=${data?.me.id}&year=${year}`}
                className='px-4 py-2 rounded bg-blue-400 text-gray-200 hover:bg-blue-600 mt-6'
                title={t('app.profile.yearlyReportTip') ?? ''}>
                {t('app.profile.report.yearlyTitle')}
              </Link>
              <a
                href={`${API_HOST}/api/rss/user/${data?.me.id}/clippings`}
                target='_blank'
                className='ml-4 px-4 py-2 rounded hover:bg-blue-400'
                title={t('app.profile.rssTip') ?? ''}
                rel="noreferrer"
              >
                RSS
              </a>
            </div>
          </div>

          <div className='w-full mt-6'>
            <PersonalActivity
              data={data.me.analysis.daily}
            />
          </div>
        </div>
      </div>

      <Divider
        label={<Text className=' dark:text-gray-100'>{t('app.profile.recents')}</Text>}
        labelPosition='center'
        className='my-8'
      />

      <Suspense fallback={<Loading />}>
        <ClippingList uid={uid} userDomain={data?.me.domain} />
      </Suspense>

      {isPickingAvatar && (
        <AvatarPicker
          onCancel={() => setIsPickingAvatar(false)}
          onSubmit={(nextAvatar) => {
            return doUpdate({
              variables: {
                avatar: nextAvatar
              }
            });
          }}
          opened={isPickingAvatar}
          uid={uid}
        />
      )}
    </section>
  );
}

export default ProfilePageContent
