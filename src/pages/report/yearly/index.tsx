import { useQuery } from '@apollo/client'
import Image from 'next/image'
import { useLocation } from '@reach/router'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Avatar from '../../../components/avatar/avatar'
import PublicBookItem from '../../../components/public-book-item/public-book-item'
import { useMultipBook } from '../../../hooks/book'
import { useTitle } from '../../../hooks/tracke'
import fetchReportYearlyQuery from '../../../schema/report.graphql'
import { fetchYearlyReport, fetchYearlyReportVariables } from '../../../schema/__generated__/fetchYearlyReport'
import { useRouter } from 'next/router'

type ReportYearlyProps = {
}

function ReportYearly(props: ReportYearlyProps) {
  // const l = useLocation()
  const searchParams = useRouter().query

  useEffect(() => {
    if (
      !searchParams.uid
    ) {
      // show toast
      return
    }
  }, [searchParams])

  const year = ~~(searchParams.year || new Date().getFullYear())

  const { data, error, loading } = useQuery<fetchYearlyReport, fetchYearlyReportVariables>(fetchReportYearlyQuery, {
    variables: {
      uid: ~~(searchParams.uid || -1),
      year
    }
  })

  const { books, loading: bookDataLoading } = useMultipBook(data?.reportYearly.books.map(x => x.doubanId) || [])

  const { t } = useTranslation()

  useTitle(`${data?.reportYearly.user.name} 的 ${year} 年读书数据`)

  return (
    <div className='w-full anna-page-container py-28 flex justify-center items-center h-min-screen'>
      {loading ? (
        <div>
          Loading...
        </div>
      ) : (
          <div className='container anna-page-container'>
            <a
              className='flex fixed top-0 left-0 w-full p-4 bg-gray-200 dark:bg-gray-700 items-center justify-around z-50'
              href='https://clippingkk.annatarhe.com'
            >
              <Image
                src={require('../../../assets/logo.png').default}
                alt="clippingkk logo"
                height={64}
                width={64}
                // className='w-16 h-16 mr-8'
              />
              <span className=' text-gray-700 dark:text-gray-200 ml-8'>{t('app.slogan')}</span>
            </a>
            <div className='flex justify-center items-center flex-col'>
              <Avatar
                img={data?.reportYearly.user.avatar ?? ''}
                name={data?.reportYearly.user.name}
                className='w-16 h-16'
              />
              <span className='text-2xl dark:text-gray-200'>{data?.reportYearly.user.name}</span>
            </div>
            <p className='text-2xl dark:text-gray-200 w-full text-center mb-4'>
              {year === (new Date().getFullYear()) ? '今' : year}年共读了 {data?.reportYearly.books.length} 本书
      </p>
            <ul className='flex justify-center items-center flex-wrap'>
              {books.map(b => (
                <div
                  className='flex flex-col justify-center items-center w-full xl:w-1/2'
                  key={b.id}>
                  <PublicBookItem book={b} />
                  <span className='dark:text-gray-200 text-xl'>
                    摘录了 {data?.reportYearly.books.find(v => ~~v.doubanId === b.doubanId)?.clippingsCount ?? 0} 条书摘
            </span>

                  <p className='italic text-gray-700 dark:text-gray-200 my-4 text-center w-full px-8'>
                    {data?.reportYearly.books.find(v => ~~v.doubanId === b.doubanId)?.clippings[0].content}
                  </p>

                  <hr className='my-4 w-full border-gray-300 dark:border-gray-700' />
                </div>
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
        )}
    </div>
  )
}

export default ReportYearly
