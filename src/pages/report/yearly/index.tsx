import { useQuery } from '@apollo/client'
import Image from 'next/image'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Head from 'next/head'
import Avatar from '../../../components/avatar/avatar'
import PublicBookItem from '../../../components/public-book-item/public-book-item'
import { useMultipBook } from '../../../hooks/book'
import fetchReportYearlyQuery from '../../../schema/report.graphql'
import { fetchYearlyReport, fetchYearlyReportVariables, fetchYearlyReport_reportYearly_books } from '../../../schema/__generated__/fetchYearlyReport'
import { useRouter } from 'next/router'
import OGWithReport from '../../../components/og/og-with-report'
import { WenquBook, wenquRequest, WenquSearchResponse } from '../../../services/wenqu'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { client } from '../../../services/ajax'
import logo from '../../../assets/logo.png'

type ReportBookItemTypes = {
  book: WenquBook
  reportDataBook: readonly fetchYearlyReport_reportYearly_books[]
}

function ReportBookItem(props: ReportBookItemTypes) {
  const b = props.book
  const books = props.reportDataBook
  const clippingsCount = books.find(v => ~~v.doubanId === b.doubanId)?.clippingsCount ?? 0
  const bookClippings = books.find(v => ~~v.doubanId === b.doubanId)?.clippings

  const sampleClipping = bookClippings ?
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

function ReportYearly(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
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

  const { data: localReportInfo, loading } = useQuery<fetchYearlyReport, fetchYearlyReportVariables>(fetchReportYearlyQuery, {
    variables: {
      uid: ~~(searchParams.uid || -1),
      year
    },
    skip: !!props.reportInfoServerData
  })

  const data = props.reportInfoServerData ?? localReportInfo

  const { books: localBooks, loading: bookDataLoading } = useMultipBook(data?.reportYearly.books.map(x => x.doubanId) || [], !!props.booksServerData)

  const books = props.booksServerData ?? localBooks

  const { t } = useTranslation()

  return (
    <div className='w-full anna-page-container py-28 flex justify-center items-center h-min-screen'>
      <Head>
        <title>{`${data?.reportYearly.user.name} 的 ${year} 年读书数据`}</title>
        <OGWithReport data={data} year={year} books={books} />
      </Head>
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
              src={logo}
              alt="clippingkk logo"
              height={64}
              width={64}
            />
            <span className=' text-gray-700 dark:text-gray-200 ml-8'>{t('app.slogan')}</span>
          </a>
          <div className='flex justify-center items-center flex-col mt-8'>
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
      )}
    </div>
  )
}

type serverSideProps = {
  reportInfoServerData: fetchYearlyReport
  booksServerData: WenquBook[]
}


export const getServerSideProps: GetServerSideProps<serverSideProps> = async (context) => {
  const uid = ~~(context.query?.uid ?? -1) as number
  const year = ~~(context.query?.year ?? new Date().getFullYear())
  // const uid = ~~(context.params?.userid ?? -1) as number
  const reportInfoResponse = await client.query<fetchYearlyReport, fetchYearlyReportVariables>({
    query: fetchReportYearlyQuery,
    fetchPolicy: 'network-only',
    variables: {
      uid,
      year
    },
  })
  // const me = useSelector<TGlobalStore, UserContent>(s => s.user.profile)
  const dbIds = reportInfoResponse.
    data.
    reportYearly.
    books.
    map(x => x.doubanId).
    filter(x => x.length > 3) ?? []

  let booksServerData: WenquBook[] = []

  if (dbIds.length >= 1) {
    const query = dbIds.join('&dbIds=')
    const books = await wenquRequest<WenquSearchResponse>(`/books/search?dbIds=${query}`)
    const bsBooks = dbIds.reduce<WenquBook[]>((acc, cur) => {
      const bb = books.books.find(x => x.doubanId.toString() === cur)
      if (bb) {
        acc.push(bb)
      }
      return acc
    }, [])
    booksServerData.push(...bsBooks)
  }

  return {
    props: {
      reportInfoServerData: reportInfoResponse.data,
      booksServerData
    },
  }
}

export default ReportYearly
