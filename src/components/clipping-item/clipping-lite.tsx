import Link from 'next/link'
import React from 'react'
import { IN_APP_CHANNEL } from '../../services/channel'
import { CDN_DEFAULT_DOMAIN } from '../../constants/config'
import styles from './clipping-lite.module.css'
import { Tooltip } from '@mantine/core'
import { Clipping, User } from '../../schema/generated'

type ClippingLiteProps = {
  clipping: Pick<
    Clipping, 'id' | 'title' | 'content'
  > & {
    creator: Pick<
      User, 'domain' | 'id' | 'name' | 'avatar'
    >
  }
}

function SimpleAvatar({ avatar }: any) {
  const imageUrl = avatar.startsWith('http') ? avatar : `${CDN_DEFAULT_DOMAIN}/${avatar}`
  return (
    <img src={imageUrl} className='w-8 h-8 rounded-full' />
  )
}


function ClippingLite(props: ClippingLiteProps) {
  const { clipping: c } = props

  return (
    <div className='w-full flex justify-center'>
      <Link
        href={`/dash/${c.creator.domain.length > 2 ? c.creator.domain : c.creator.id}/clippings/${c.id}?iac=${IN_APP_CHANNEL.clippingFromUser}`}
        className={`h-64 lg:h-96 max-w-4xl w-full p-8 flex flex-col text-slate-800 dark:text-slate-200`}
        data-glow
        style={{
          borderRadius: 12,
          // '--base': 80,
          '--base': c.creator.id,
          '--spread': 20,
          '--outer': 1,
          backdropFilter: 'blur(calc(var(--cardblur, 1) * 1px))'
        } as React.CSSProperties}
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
  )
}

export default ClippingLite
