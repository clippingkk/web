'use client'
import Image from 'next/image'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Head from 'next/head'
import Avatar from '../../../components/avatar/avatar'
import PublicBookItem from '../../../components/public-book-item/public-book-item'
import { useRouter } from 'next/router'
import OGWithReport from '../../../components/og/og-with-report'
import { WenquBook, wenquRequest, WenquSearchResponse } from '../../../services/wenqu'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { client } from '../../../services/ajax'
import logo from '../../../assets/logo.png'
import { FetchClippingQueryVariables, FetchYearlyReportDocument, FetchYearlyReportQuery, FetchYearlyReportQueryVariables } from '../../../schema/generated'
import { useMultipBook } from '../../../hooks/book'

type ReportBookItemTypes = {
  book: WenquBook
  reportDataBook: FetchYearlyReportQuery['reportYearly']['books']
}

function ReportBookItem(props: ReportBookItemTypes) {
  const b = props.book
  const books = props.reportDataBook
  const clippingsCount = books.find(v => ~~v.doubanId === b.doubanId)?.clippingsCount ?? 0
  const bookClippings = books.find(v => ~~v.doubanId === b.doubanId)?.clippings

  const sampleClipping = bookClippings && bookClippings.length > 0 ?
    bookClippings[Math.floor(Math.random() * bookClippings.length)].content :
    ''

  return (
    <div
      className='flex flex-col justify-center items-center w-full xl:w-1/2'
    >
      <PublicBookItem book={b} />
      <span className='dark:text-gray-200 text-xl'>
        摘录了 {clippingsCount} 条书摘
      </span>

      <p className='italic text-gray-700 dark:text-gray-200 my-4 text-center w-full px-8'>
        {sampleClipping}
      </p>
      <hr className='my-4 w-full border-gray-300 dark:border-gray-700' />
    </div>
  )
}

type ReportYearlyProps = {
  uid: number
  year: number
  reportInfoServerData: FetchYearlyReportQuery
  dbIds: string[]
}

function ReportYearly(props: ReportYearlyProps) {
  const { year, dbIds, reportInfoServerData: data} = props

  const { t } = useTranslation()

  const bs = useMultipBook(dbIds)
  const books = bs.books

  const containerStyle = useMemo<React.CSSProperties | undefined>(() => {
    if (books.length === 0) {
      return undefined
    }
    return {
      // backgroundImage: `url(https://picsum.photos/${width}/${height}/?blur=10)`
      backgroundImage: `url(${books[0].image})`,
    }
  }, [books])

  return (
    <div
      className='w-full anna-page-container flex justify-center items-center h-min-screen bg-no-repeat bg-cover bg-center'
      style={containerStyle}
    >
      <div className='w-full min-h-screen backdrop-blur-xl bg-gray-400 dark:bg-gray-900 dark:bg-opacity-80 bg-opacity-60 pb-28'>
        <a
          className='flex sticky top-0 left-0 w-full p-4 bg-opacity-80 dark:bg-opacity-80 bg-gray-200 dark:bg-gray-800 backdrop-blur-lg items-center justify-around z-50'
          href='https://clippingkk.annatarhe.com'
        >
          <Image
            src={logo}
            alt="clippingkk logo"
            height={64}
            width={64}
          />
          <span className=' text-gray-700 dark:text-gray-200 ml-8'>{t('app.slogan')}</span>
        </a>
        <div className='container m-auto'>
          <div className='flex justify-center items-center flex-col mt-8 mb-1'>
            <Avatar
              img={data?.reportYearly.user.avatar ?? ''}
              name={data?.reportYearly.user.name}
              className='w-24 h-24'
            />
            <span className='text-2xl dark:text-gray-200'>{data?.reportYearly.user.name}</span>
          </div>
          <p className='text-2xl dark:text-gray-200 w-full text-center mb-4'>
            {year === (new Date().getFullYear()) ? '今' : year}年共读了 {data?.reportYearly.books.length} 本书
          </p>
          <ul className='flex justify-center items-center flex-wrap'>
            {books.map(b => (
              <ReportBookItem
                key={b.id}
                book={b}
                reportDataBook={data.reportYearly.books || []}
              />
            ))}
          </ul>

          <p className='text-sm text-gray-700 dark:text-gray-200 w-full text-center px-8'>
            使用电脑浏览器打开
            <a
              href="https://clippingkk.annatarhe.com"
              className='text-gray-700 dark:text-gray-200 mx-2'
            >https://clippingkk.annatarhe.com</a>
            拖入 kindle 文件即可同步
          </p>
        </div>
      </div>
    </div>
  )
}

export default ReportYearly
