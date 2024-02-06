'use client';
import Link from 'next/link'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { CDN_DEFAULT_DOMAIN } from '../../constants/config'
import { Clipping, User } from '../../schema/generated'
import { IN_APP_CHANNEL } from '../../services/channel'
import styles from './top-clippings.module.css'
import { Tooltip } from '@mantine/core';

// const styles = require('').default

type TopClippingsProps = {
  clippings: (Pick<Clipping, 'id' | 'title' | 'content'> & { creator: Pick<User, 'domain' | 'id' | 'name' | 'avatar'> })[]
}

function SimpleAvatar({ avatar }: any) {
  const imageUrl = avatar.startsWith('http') ? avatar : `${CDN_DEFAULT_DOMAIN}/${avatar}`
  return (
    <img src={imageUrl} className='w-8 h-8 rounded-full' />
  )
}

function TopClippings(props: TopClippingsProps) {
  const { t } = useTranslation()

  return (
    <div className='flex flex-wrap justify-center items-center flex-col mx-4'>
      <h2 className='text-3xl text-center font-bold my-8 dark:text-gray-200 text-slate-900'>
        {t('app.public.clippings')}
      </h2>
      <div className='grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-2 gap-8 w-full'>
        {props.clippings?.map(c => (
          <div
            key={c.id}
            className='w-full flex justify-center'
          >
            <Link
              href={`/dash/${c.creator.domain.length > 2 ? c.creator.domain : c.creator.id}/clippings/${c.id}?iac=${IN_APP_CHANNEL.clippingFromUser}`}
              className={`h-96 max-w-4xl w-full p-8 flex flex-col text-slate-800 dark:text-slate-200`}
              data-glow
              style={{
                borderRadius: 12,
                // '--base': 80,
                '--base': c.creator.id,
                '--spread': 20,
                '--outer': 1,
                'backdrop-filter': 'blur(calc(var(--cardblur, 1) * 1px))'
              } as any}
            >
              <div className='flex-1'>
                <p
                  className={`text-xl leading-relaxed font-lxgw ${styles.clippingText}`}
                >
                  {c.content}
                </p>
              </div>
              <div className='flex justify-between items-center'>
                <div className='flex items-center '>
                  <SimpleAvatar avatar={c.creator.avatar} />
                  <span className='ml-2'>{c.creator.name}</span>
                </div>
                <div className='ml-4'>
                  <Tooltip label={c.title} withArrow transitionProps={{ duration: 200, transition: 'pop' }}>
                    <span className='text-right font-lxgw line-clamp-2'>{c.title}</span>
                  </Tooltip>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopClippings
