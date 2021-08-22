import React, { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import Card from '../../components/card/card';
import Divider from '../../components/divider/divider';
import ClippingItem from '../../components/clipping-item/clipping-item';
import { usePageTrack, useTitle } from '../../hooks/tracke'
import { useMutation, useQuery } from '@apollo/client'
import profileQuery from '../../schema/profile.graphql'
import followMutation from '../../schema/mutations/follow.graphql'
import unfollowMutation from '../../schema/mutations/unfollow.graphql'
import { profile, profileVariables } from '../../schema/__generated__/profile';
import WechatBindButton from './bind';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import Avatar from '../../components/avatar/avatar';
import { Link } from '@reach/router';
import ProfileEditor from './profile-editor';
import { useSelector } from 'react-redux';
import { TGlobalStore } from '../../store';
import MasonryContainer from '../../components/masonry-container';
import ProfileBindPhone from './bind-phone';
import { IN_APP_CHANNEL } from '../../services/channel';
import { API_HOST } from '../../constants/config';
import { followUser, followUserVariables } from '../../schema/mutations/__generated__/followUser';
import { unfollowUser, unfollowUserVariables } from '../../schema/mutations/__generated__/unfollowUser';
import { toast } from 'react-toastify';

const styles = require('./profile.css').default

type TProfileProps = {
  userid: string
}

function Profile(props: TProfileProps) {
  const { data, loading, called, fetchMore } = useQuery<profile, profileVariables>(profileQuery, {
    variables: {
      id: ~~props.userid
    }
  })

  const [doFollow, { loading: followLoading }] = useMutation<followUser, followUserVariables>(followMutation)
  const [doUnfollow, { loading: unfollowLoading }] = useMutation<unfollowUser, unfollowUserVariables>(unfollowMutation)

  const uid = useSelector<TGlobalStore, number>(s => s.user.profile.id)
  usePageTrack('profile', {
    userId: props.userid
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
  }, [data?.me.analysis.monthly.length])

  const year = (new Date()).getFullYear() - ((new Date()).getMonth() > 6 ? 0 : 1)

  const isInMyPage = uid.toString() !== props.userid

  const isWechatBindingVisible = useMemo(() => {
    if (!isInMyPage) {
      return false
    }
    if (uid === 0) {
      return false
    }

    return !data?.me.wechatOpenid
  }, [data, isInMyPage])

  return (
    <section>
      <Card className='flex items-center justify-center py-12 w-full lg:w-4/5 mx-auto mt-20 anna-fade-in bg-gray-200 bg-opacity-75'>
        <div className='flex flex-col items-center justify-center w-full'>
          <div className='w-full flex items-center justify-center'>
            <Avatar img={data?.me.avatar ?? ''} name={data?.me.name} className='w-16 h-16 mr-12 lg:w-32 lg:h-32' />
            <div className={styles.info}>
              <div className='flex items-center'>
                <h3 className='text-2xl'>{data?.me.name}</h3>
                {data?.me.phone === '' && (
                  <ProfileBindPhone />
                )}
                {uid === data?.me.id && (
                  <ProfileEditor
                    bio={data.me.bio}
                    withNameChange={data.me.name.startsWith('user.')}
                  />
                )}
              </div>
              <h5 className='text-lg text-gray-800'>{t('app.profile.collected', { count: data?.me.clippingsCount })}</h5>
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
                  title={t(`app.profile.fans.${data?.me.isFan ? 'unfollow' : ''}follow`)}
                  disabled={followLoading || unfollowLoading}
                  onClick={() => {
                    if (followLoading || unfollowLoading) {
                      return
                    }
                    const params: followUserVariables = {targetUserID: ~~props.userid }
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
                  {t(`app.profile.fans.${data?.me.isFan ? 'unfollow' : ''}follow`)}
                </button>
              )}

              <Link
                to={`/report/yearly?uid=${data?.me.id}&year=${year}`}
                className='px-4 py-2 rounded bg-blue-400 text-gray-200 hover:bg-blue-600 mt-6'
                title={t('app.profile.yearlyReportTip')}
              >
                {t('app.profile.report.yearlyTitle')}
              </Link>
              <a
                href={`${API_HOST}/api/rss/user/${data?.me.id}/clippings`}
                target='_blank'
                className='ml-4 px-4 py-2 rounded hover:bg-blue-400'
                title={t('app.profile.rssTip')}
              >
                RSS
              </a>
            </div>
          </div>

          <div className='w-full h-64 mt-6'>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0277d7" />
              </BarChart>
            </ResponsiveContainer>
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
              userid={~~props.userid}
              inAppChannel={IN_APP_CHANNEL.clippingFromUser}
            />)
          )}
        </React.Fragment>
      </MasonryContainer>
    </section>
  )
}

export default Profile
