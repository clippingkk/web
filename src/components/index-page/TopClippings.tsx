'use client';
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Clipping, User } from '../../schema/generated'
import ClippingLite from '../clipping-item/clipping-lite';

type TopClippingsProps = {
  clippings: (Pick<Clipping, 'id' | 'title' | 'content'> & { creator: Pick<User, 'domain' | 'id' | 'name' | 'avatar'> })[]
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
          <ClippingLite key={c.id} clipping={c} />
        ))}
      </div>
    </div>
  );
}

export default TopClippings
