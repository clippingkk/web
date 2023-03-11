import React from 'react'
import Card from '../card/card';
import { WenquBook } from '../../services/wenqu';
import { useTranslation } from 'react-i18next';
import Avatar from '../avatar/avatar';
import ClippingContent from '../clipping-content';
import { IN_APP_CHANNEL } from '../../services/channel';

import styles from './clipping-item.module.css'
import Link from 'next/link';
import { Clipping, User } from '../../schema/generated';

type TClippingItemProps = {
  item: Pick< Clipping, 'id' | 'bookID' | 'title' | 'content'>
  book?: WenquBook
  domain: string
  inAppChannel: IN_APP_CHANNEL
  creator?: Pick<User, 'avatar' | 'id' | 'name' | 'clippingsCount'>
}

function ClippingItem({ domain, item, book, creator, inAppChannel }: TClippingItemProps) {
  const { t } = useTranslation()
  return (
    <Link
      href={`/dash/${domain}/clippings/${item.id}?iac=${inAppChannel}`}
      key={item.id}
      className='block mx-2 md:mx-0'>

      <Card className={styles.clipping + ' lg:p-10 p-2 hover:shadow-2xl transition-all duration-300'} style={{ margin: '1rem 0' }}>
        <>
          <h3 className='lg:text-3xl text-xl font-lxgw'>
            {book?.title ?? item.title}
          </h3>
          <hr className='my-4' />
          <ClippingContent content={item.content} className='lg:text-2xl text-gray-900 font-lxgw' />
          {creator && (
            <React.Fragment>
              <hr className='my-4 self-end' />
              <div className='flex w-full justify-between'>
                <div className='flex justify-center items-center'>
                  <Avatar
                    img={creator.avatar}
                    name={creator.name}
                    className='w-10 h-10 mr-4'
                  />
                  <span>{creator.name}</span>
                </div>
                <div>
                  <span>{t('app.profile.records', {
                    count: creator.clippingsCount
                  })} </span>
                </div>
              </div>
            </React.Fragment>
          )}
        </>
      </Card>
    </Link>
  );
}

export default ClippingItem
