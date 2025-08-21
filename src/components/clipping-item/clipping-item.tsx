import Link from 'next/link'
import React from 'react'
import { useTranslation } from '@/i18n/client'
import type { Clipping, User } from '@/schema/generated'
import type { IN_APP_CHANNEL } from '../../services/channel'
import type { WenquBook } from '../../services/wenqu'
import Avatar from '../avatar/avatar'
import ClippingContent from '../clipping-content'

type TClippingItemProps = {
  className?: string
  item: Pick<Clipping, 'id' | 'bookID' | 'title' | 'content'>
  book?: WenquBook
  domain: string
  inAppChannel: IN_APP_CHANNEL
  creator?: Pick<User, 'avatar' | 'id' | 'name' | 'clippingsCount'>
}

// style={{
//   // '--base': 80,
//   '--base': item.id,
//   '--spread': 200,
//   '--outer': 1,
//   backdropFilter: 'blur(calc(var(--cardblur, 5) * 1px))'
// } as any}

function ClippingItem(props: TClippingItemProps) {
  const { domain, item, book, creator, inAppChannel, className = '' } = props
  const { t } = useTranslation()
  return (
    <Link
      href={`/dash/${domain}/clippings/${item.id}?iac=${inAppChannel}`}
      key={item.id}
      className={`mx-2 mb-6 block md:mx-4 ${className}`}
    >
      <div
        className={
          'rounded-2xl border border-slate-100/50 bg-slate-50/80 p-6 text-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-xl transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-slate-200/70 hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] lg:p-8 dark:border-slate-700/50 dark:bg-slate-800/70 dark:text-slate-100 dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] dark:hover:border-slate-600/50 dark:hover:shadow-[0_8px_40px_rgb(0,0,0,0.4)]'
        }
      >
        <h3 className='font-lxgw mb-6 text-2xl leading-relaxed font-medium lg:text-3xl'>
          {book?.title ?? item.title}
        </h3>
        <div className='mb-6 h-px w-full bg-linear-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700'></div>
        <ClippingContent
          content={item.content}
          className='font-lxgw text-lg leading-relaxed text-slate-700 lg:text-2xl dark:text-slate-300'
        />
        {creator && (
          <React.Fragment>
            <div className='my-6 h-px w-full bg-linear-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700'></div>
            <div className='flex w-full items-center justify-between'>
              <div className='flex min-w-0 items-center space-x-4'>
                <Avatar
                  img={creator.avatar}
                  name={creator.name}
                  className='h-12 w-12 shrink-0 ring-2 ring-slate-100 dark:ring-slate-700'
                />
                <span className='truncate font-medium text-slate-800 dark:text-slate-200'>
                  {creator.name}
                </span>
              </div>
              <div className='text-sm text-nowrap text-slate-600 dark:text-slate-400'>
                <span>
                  {t('app.profile.records', {
                    count: creator.clippingsCount,
                  })}{' '}
                </span>
              </div>
            </div>
          </React.Fragment>
        )}
      </div>
    </Link>
  )
}

export default ClippingItem
