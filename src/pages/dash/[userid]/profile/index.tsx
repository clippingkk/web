import React, { useMemo, useState } from 'react'
import Head from 'next/head'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import Card from '../../../../components/card/card';
import Divider from '../../../../components/divider/divider';
import ClippingItem from '../../../../components/clipping-item/clipping-item';
import { usePageTrack, useTitle } from '../../../../hooks/tracke'
import { useMutation } from '@apollo/client'
import profileQuery from '../../../../schema/profile.graphql'
import followMutation from '../../../../schema/mutations/follow.graphql'
import unfollowMutation from '../../../../schema/mutations/unfollow.graphql'
import { profile, profileVariables } from '../../../../schema/__generated__/profile';
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
import { followUser, followUserVariables } from '../../../../schema/mutations/__generated__/followUser'
import { unfollowUser, unfollowUserVariables } from '../../../../schema/mutations/__generated__/unfollowUser'
import { toast } from 'react-hot-toast'

import styles from './profile.module.css'
import DashboardContainer from '../../../../components/dashboard-container/container';
import Link from 'next/link';
import OGWithUserProfile from '../../../../components/og/og-with-user-profile';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { client } from '../../../../services/ajax';
import CliApiToken from './cli-api';
import NFTGallary from '../../../../components/nfts/nft-gallary';
import Dialog from '../../../../components/dialog/dialog';
import { ProfileQuery, ProfileQueryVariables, useProfileQuery, useUpdateProfileMutation } from '../../../../schema/generated';
import { toastPromiseDefaultOption } from '../../../../services/misc';
import AvatarPicker from '../../../../components/profile/avatar-picker';
import PersonalActivity from '../../../../components/profile/activity';

function Profile(serverResponse: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // 优先使用本地数据，服务端数据只是为了 seo
  const data = serverResponse.profileServerData

  const [isPickingAvatar, setIsPickingAvatar] = useState(false)

  const [doFollow, { loading: followLoading }] = useMutation<followUser, followUserVariables>(followMutation)
  const [doUnfollow, { loading: unfollowLoading }] = useMutation<unfollowUser, unfollowUserVariables>(unfollowMutation)

  const [doUpdate, { client: apolloClient }] = useUpdateProfileMutation()

  const uid = useSelector<TGlobalStore, number>(s => s.user.profile.id)
  usePageTrack('profile', {
    userId: data.me.id
  })

  useTitle(data?.me.name)
  const { t } = useTranslation()

  const chartData = useMemo(() => {
    const c = []
    for (let i = 12; i > 0; i--) {
      const date = dayjs().startOf('month').subtract(i, 'month').format('YYYY-MM')
      c.push({
        date,
        count: data?.me.analysis.monthly.find(x => x.date === date)?.count ?? 0
      })
    }
    return c
  }, [data?.me.analysis.monthly])

  const year = (new Date()).getFullYear() - ((new Date()).getMonth() > 6 ? 0 : 1)

  const isInMyPage = uid === data.me.id

  const isWechatBindingVisible = useMemo(() => {
    if (uid === 0) {
      return false
    }

    if (!isInMyPage) {
      return false
    }
    return !!data?.me.wechatOpenid
  }, [data, uid, isInMyPage])

  return (
    <section>
      <Head>
        <title>{data?.me.name}`s profile</title>
        <OGWithUserProfile profile={data?.me} />
      </Head>
      <Card className='flex items-center justify-center py-12 w-full lg:w-4/5 mx-auto mt-20 anna-fade-in bg-gray-200 bg-opacity-75'>
        <div className='flex flex-col items-center justify-center w-full'>
          <div className='w-full flex items-center justify-center'>
            <Avatar
              img={data?.me.avatar ?? ''}
              name={data?.me.name}
              editable={uid === data.me.id}
              className='w-16 h-16 mr-12 lg:w-32 lg:h-32'
              onClick={() => setIsPickingAvatar(true)}
            />
            <div className={styles.info}>
              <div className='flex items-center'>
                <h3 className='text-2xl'>{data?.me.name}</h3>
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
              <h5 className='text-lg text-gray-800'>
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
                  title={t(`app.profile.fans.${data?.me.isFan ? 'un' : ''}follow`)}
                  disabled={followLoading || unfollowLoading}
                  onClick={() => {
                    if (followLoading || unfollowLoading) {
                      return
                    }
                    const params: followUserVariables = { targetUserID: data.me.id }
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
                title={t('app.profile.yearlyReportTip')}>

                {t('app.profile.report.yearlyTitle')}

              </Link>
              <a
                href={`${API_HOST}/api/rss/user/${data?.me.id}/clippings`}
                target='_blank'
                className='ml-4 px-4 py-2 rounded hover:bg-blue-400'
                title={t('app.profile.rssTip')}
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
      </Card>

      <Divider title={t('app.profile.recents')} />

      <MasonryContainer className='anna-fade-in'>
        <React.Fragment>
          {data?.me.recents.map(
            (item => <ClippingItem
              key={item.id}
              item={item}
              domain={data.me.domain.length > 2 ? data.me.domain : data.me.id.toString()}
              inAppChannel={IN_APP_CHANNEL.clippingFromUser}
            />)
          )}
        </React.Fragment>
      </MasonryContainer>
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

type serverSideProps = {
  profileServerData: ProfileQuery
}

export const getServerSideProps: GetServerSideProps<serverSideProps> = async (context) => {
  const pathUid: string = (context.params?.userid as string) ?? ''
  const uid = parseInt(pathUid)
  const profileResponse = await client.query<ProfileQuery, ProfileQueryVariables>({
    query: profileQuery,
    fetchPolicy: 'network-only',
    variables: {
      id: Number.isNaN(uid) ? -1 : uid,
      domain: Number.isNaN(uid) ? pathUid : null
    },
  })
  return {
    props: {
      profileServerData: profileResponse.data,
    },
  }
}

Profile.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <DashboardContainer>
      {page}
    </DashboardContainer>
  )
}

export default Profile
