import React from 'react'
import { WenquBook } from '../../services/wenqu'
import { useTranslation } from 'react-i18next'
import Avatar from '../avatar/avatar'
import ClippingContent from '../clipping-content'
import { IN_APP_CHANNEL } from '../../services/channel'
import { Clipping, User } from '@/schema/generated'

import Link from 'next/link'

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
      className={'block mx-2 md:mx-4 mb-6 ' + className}
    >
      <div 
        className={`
          bg-slate-50/80 dark:bg-slate-800/70 backdrop-blur-xl
          p-6 lg:p-8 rounded-2xl
          shadow-[0_8px_30px_rgb(0,0,0,0.08)]
          dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]
          hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)]
          dark:hover:shadow-[0_8px_40px_rgb(0,0,0,0.4)]
          transition-all duration-300 ease-in-out
          border border-slate-100/50 dark:border-slate-700/50
          hover:border-slate-200/70 dark:hover:border-slate-600/50
          text-slate-900 dark:text-slate-100
          hover:-translate-y-1
        `}
      >
        <>
          <h3 className='text-2xl lg:text-3xl font-lxgw font-medium mb-6 leading-relaxed'>
            {book?.title ?? item.title}
          </h3>
          <div className='w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent mb-6'></div>
          <ClippingContent content={item.content} className='text-lg lg:text-2xl font-lxgw leading-relaxed text-slate-700 dark:text-slate-300' />
          {creator && (
            <React.Fragment>
              <div className='w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent my-6'></div>
              <div className='flex w-full justify-between items-center'>
                <div className='flex items-center space-x-4 min-w-0'>
                  <Avatar
                    img={creator.avatar}
                    name={creator.name}
                    className='w-12 h-12 ring-2 ring-slate-100 dark:ring-slate-700 flex-shrink-0'
                  />
                  <span className='font-medium text-slate-800 dark:text-slate-200 truncate'>{creator.name}</span>
                </div>
                <div className='text-sm text-nowrap text-slate-600 dark:text-slate-400'>
                  <span>{t('app.profile.records', {
                    count: creator.clippingsCount
                  })} </span>
                </div>
              </div>
            </React.Fragment>
          )}
        </>
      </div>
    </Link>
  )
}

export default ClippingItem
