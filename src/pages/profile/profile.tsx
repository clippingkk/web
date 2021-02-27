import React, { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import Card from '../../components/card/card';
import Divider from '../../components/divider/divider';
import ClippingItem from '../../components/clipping-item/clipping-item';
import { usePageTrack, useTitle } from '../../hooks/tracke'
import { useQuery } from '@apollo/client'
import profileQuery from '../../schema/profile.graphql'
import { profile, profileVariables } from '../../schema/__generated__/profile';
import WechatBindButton from './bind';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import Avatar from '../../components/avatar/avatar';
import { Link } from '@reach/router';
import ProfileEditor from './profile-editor';
import { useSelector } from 'react-redux';
import { TGlobalStore } from '../../store';

const styles = require('./profile.css').default

type TProfileProps = {
  userid: string
}

function Profile(props: TProfileProps) {
  const { data } = useQuery<profile, profileVariables>(profileQuery, {
    variables: {
      id: ~~props.userid
    }
  })
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

  return (
    <section>
      <Card className='flex items-center justify-center py-12 w-full lg:w-4/5 mx-auto mt-20 anna-fade-in bg-gray-200 bg-opacity-75'>
        <div className='flex flex-col items-center justify-center w-full'>

          <div className='w-full flex items-center justify-center'>
            <Avatar img={data?.me.avatar ?? ''} name={data?.me.name} className='w-16 h-16 mr-12 lg:w-32 lg:h-32' />
            <div className={styles.info}>
              <div className='flex items-center'>
                <h3 className='text-2xl'>{data?.me.name}</h3>
                {uid === data?.me.id && (<ProfileEditor bio={data.me.bio} />)}
              </div>
              <h5 className='text-lg text-gray-800'>{t('app.profile.collected')} {data?.me.clippingsCount} {t('app.profile.records')}</h5>
              <div className='mb-4'>
                {data?.me.bio.split('\n').map((v, i) => (
                  <p key={i}>{v}</p>
                ))}
              </div>
              {!data?.me.wechatOpenid && (<WechatBindButton />)}
              <Link
                to={`/report/yearly?uid=${data?.me.id}&year=${year}`}
                className='px-4 py-2 rounded bg-blue-400 text-gray-200 hover:bg-blue-600 mt-6'
              >
                {t('app.profile.report.yearlyTitle')}
              </Link>
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

      <div className='masonry-1 lg:masonry-2 xl:masonry-3 2xl:masonry-4 masonry-gap-4 mb-16'>
        {data?.me.recents.map(
          (item => <ClippingItem key={item.id} item={item} userid={~~props.userid} />)
        )}
      </div>
    </section>
  )
}

export default Profile
