'use client';
import React from 'react'
import { useTranslation } from 'react-i18next'
import PublicBookItem from '../public-book-item/public-book-item'
import { WenquBook } from '../../services/wenqu'

type TopBooksProps = {
  books: WenquBook[]
}

function TopBooks(props: TopBooksProps) {
  const { t } = useTranslation()
  return (
    <div>
      <h2 className='text-3xl text-center font-bold my-8 dark:text-gray-200 text-slate-900'>
        {t('app.public.readings')}
      </h2>
      <div className='flex gap-8 py-8 md:px-12 flex-wrap justify-center items-center'>
        {props.books.map(b => <PublicBookItem key={b.id} book={b} />)}
      </div>
    </div>
  )
}

export default TopBooks
