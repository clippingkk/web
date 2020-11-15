import React, { useEffect, useMemo, useState } from 'react'
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { getUserProfile, IUserProfile } from '../../services/auth';
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


  return (
    <section>
      <Card className='flex items-center justify-center py-12 w-full lg:w-4/5 mx-auto my-20 anna-fade-in bg-gray-200 bg-opacity-75'>
        <div className='flex flex-col items-center justify-center w-full'>

          <div className='w-full flex items-center justify-center'>
            <Avatar img={data?.me.avatar ?? ''} name={data?.me.name} className='w-32 h-32 mr-12' />
            <div className={styles.info}>
              <h3 className='text-2xl'>{data?.me.name}</h3>
              <h5 className='text-lg text-gray-800'>{t('app.profile.collected')} {data?.me.clippingsCount} {t('app.profile.records')}</h5>
              {!data?.me.wechatOpenid && (
                <WechatBindButton />
              )}
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

      <div className='flex flex-wrap justify-center items-center mb-16'>
        {data?.me.recents.map(
          (item => <ClippingItem key={item.id} item={item} userid={~~props.userid} />)
        )}
      </div>
    </section>
  )
}

export default Profile
