import React from 'react'
import { publicData_public_books } from '../../schema/__generated__/publicData'
import { useMultipBook } from '../../hooks/book'
import { useTranslation } from 'react-i18next'
import PublicBookItem from '../../components/public-book-item/public-book-item'

const styles = require('./tops.module.css').default

type TopBooksProps = {
  books?: readonly publicData_public_books[]
}

function TopBooks(props: TopBooksProps) {
  const { t } = useTranslation()

  const { books } = useMultipBook(props.books?.map(x => x.doubanId) || [])

  return (
    <div>
      <h2 className='text-3xl text-center font-bold my-8 dark:text-gray-200'>{t('app.public.readings')}</h2>
      <div className='flex py-8 md:px-12 flex-wrap justify-center items-center'>
        {books.map(b => <PublicBookItem key={b.id} book={b} />)}
      </div>
    </div>
  )
}

export default TopBooks
