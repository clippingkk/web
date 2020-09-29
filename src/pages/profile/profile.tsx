import React, { useEffect, useState } from 'react'
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

const styles = require('./profile.css')

type TProfileProps = {
  userid: string
}

function useProfile(userid: string): IUserProfile {
  const [user, setUser] = useState({} as any)
  const [clippingsCount, setClippingsCount] = useState(0)
  const [clippings, setClippings] = useState([] as any[])

  useEffect(() => {
    getUserProfile(userid).then(resp => {
      setUser(resp.user)
      setClippings(resp.clippings)
      setClippingsCount(resp.clippingsCount)
    })
  }, [])

  return { user, clippingsCount, clippings }
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

  return (
    <section>
      <Card className={styles.userinfo}>
        <img src={data?.me.avatar} className={styles.avatar} />
        <div className={styles.info}>
          <h3 className={styles.username}>{data?.me.name}</h3>
          <h5 className={styles.text}>{t('app.profile.collected')} {data?.me.clippingsCount} {t('app.profile.records')}</h5>
          <WechatBindButton />
        </div>
      </Card>

      <Divider title={t('app.profile.recents')} />

      <div className={styles.clippings}>
        {data?.me.recents.map(
          (item => <ClippingItem key={item.id} item={item} userid={~~props.userid} />)
        )}
      </div>
    </section>
  )
}

export default Profile
