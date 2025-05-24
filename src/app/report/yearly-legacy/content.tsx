'use client'
import logo from '@/assets/logo.png'
import Avatar from '@/components/avatar/avatar'
import PublicBookItem from '@/components/public-book-item/public-book-item'
import { useMultipleBook } from '@/hooks/book'
import { useTranslation } from '@/i18n/client'
import { FetchYearlyReportQuery } from '@/schema/generated'
import { WenquBook } from '@/services/wenqu'
import Image from 'next/image'
import React, { useMemo } from 'react'

type ReportBookItemTypes = {
  book: WenquBook
  reportDataBook: FetchYearlyReportQuery['reportYearly']['books']
}

function ReportBookItem(props: ReportBookItemTypes) {
  const b = props.book
  const books = props.reportDataBook
  const clippingsCount =
    books.find((v) => ~~v.doubanId === b.doubanId)?.clippingsCount ?? 0
  const bookClippings = books.find(
    (v) => ~~v.doubanId === b.doubanId
  )?.clippings

  const sampleClipping =
    bookClippings && bookClippings.length > 0
      ? bookClippings[Math.floor(Math.random() * bookClippings.length)].content
      : ''

  return (
    <div className="flex w-full flex-col items-center justify-center xl:w-1/2">
      <PublicBookItem book={b} />
      <span className="text-xl dark:text-gray-200">
        摘录了 {clippingsCount} 条书摘
      </span>

      <p className="my-4 w-full px-8 text-center text-gray-700 italic dark:text-gray-200">
        {sampleClipping}
      </p>
      <hr className="my-4 w-full border-gray-300 dark:border-gray-700" />
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
  const { year, dbIds, reportInfoServerData: data } = props

  const { t } = useTranslation()

  const bs = useMultipleBook(dbIds)
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
      className="anna-page-container h-min-screen flex w-full items-center justify-center bg-cover bg-center bg-no-repeat"
      style={containerStyle}
    >
      <div className="dark:bg-opacity-80 bg-opacity-60 min-h-screen w-full bg-gray-400 pb-28 backdrop-blur-xl dark:bg-gray-900">
        <a
          className="bg-opacity-80 dark:bg-opacity-80 sticky top-0 left-0 z-50 flex w-full items-center justify-around bg-gray-200 p-4 backdrop-blur-lg dark:bg-gray-800"
          href="https://clippingkk.annatarhe.com"
        >
          <Image src={logo} alt="clippingkk logo" height={64} width={64} />
          <span className="ml-8 text-gray-700 dark:text-gray-200">
            {t('app.slogan')}
          </span>
        </a>
        <div className="container m-auto">
          <div className="mt-8 mb-1 flex flex-col items-center justify-center">
            <Avatar
              img={data?.reportYearly.user.avatar ?? ''}
              name={data?.reportYearly.user.name}
              className="h-24 w-24"
            />
            <span className="text-2xl dark:text-gray-200">
              {data?.reportYearly.user.name}
            </span>
          </div>
          <p className="mb-4 w-full text-center text-2xl dark:text-gray-200">
            {year === new Date().getFullYear() ? '今' : year}年共读了{' '}
            {data?.reportYearly.books.length} 本书
          </p>
          <ul className="flex flex-wrap items-center justify-center">
            {books.map((b) => (
              <ReportBookItem
                key={b.id}
                book={b}
                reportDataBook={data.reportYearly.books || []}
              />
            ))}
          </ul>

          <p className="w-full px-8 text-center text-sm text-gray-700 dark:text-gray-200">
            使用电脑浏览器打开
            <a
              href="https://clippingkk.annatarhe.com"
              className="mx-2 text-gray-700 dark:text-gray-200"
            >
              https://clippingkk.annatarhe.com
            </a>
            拖入 kindle 文件即可同步
          </p>
        </div>
      </div>
    </div>
  )
}

export default ReportYearly
