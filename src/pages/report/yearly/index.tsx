import Image from 'next/image'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Head from 'next/head'
import Avatar from '../../../components/avatar/avatar'
import fetchReportYearlyQuery from '../../../schema/report.graphql'
import { fetchYearlyReport, fetchYearlyReportVariables, fetchYearlyReport_reportYearly_books, fetchYearlyReport_reportYearly_books_clippings } from '../../../schema/__generated__/fetchYearlyReport'
import { useRouter } from 'next/router'
import OGWithReport from '../../../components/og/og-with-report'
import { WenquBook, wenquRequest, WenquSearchResponse } from '../../../services/wenqu'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { client } from '../../../services/ajax'
import logo from '../../../assets/logo.png'
import ReportBookSection from '../../../components/reports/report-book-section'
import { Blockquote, Divider } from '@mantine/core'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import ReportHero from '../../../components/reports/report-hero'
import { useBackgroundImage } from '../../../hooks/theme'

type PageContainerProps = {
  bgImage?: string
  children: React.ReactElement
}

function PageContainer(props: PageContainerProps) {
  const containerStyle = useMemo<React.CSSProperties | undefined>(() => {
    return {
      backgroundImage: `url(${props.bgImage})`,
    }
  }, [props.bgImage])
  return (
    <section
      className='flex w-screen min-h-screen justify-center items-center flex-col bg-cover bg-center bg-no-repeat'
      style={containerStyle}
    >
      <div className='w-screen min-h-screen backdrop-blur-xl bg-gray-400 dark:bg-gray-900 dark:bg-opacity-80 bg-opacity-60 flex justify-center items-center flex-col '>
        {props.children}
      </div>
    </section>
  )
}

function ReportYearly(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const searchParams = useRouter().query
  const year = ~~(searchParams.year || new Date().getFullYear())
  const data = props.reportInfoServerData
  const books = props.booksServerData

  const { t } = useTranslation()

  const [randomQuote, setRandomQuote] = useState<{ book: WenquBook, clipping: fetchYearlyReport_reportYearly_books_clippings } | null>(null)

  useEffect(() => {
    function flushQuote() {
      const bkss = data.reportYearly.books
      if (bkss.length === 0) {
        setRandomQuote(null)
        return
      }
      const cks = bkss[Math.floor(Math.random() * bkss.length)]
      const bk = books.find(x => x.doubanId.toString() === cks.doubanId)
      if (cks.clippings.length === 0 || !bk) {
        setRandomQuote(null)
        return
      }
      const ck = cks.clippings[Math.floor(Math.random() * cks.clippings.length)]
      setRandomQuote({
        book: bk,
        clipping: ck
      })
    }
    flushQuote()
    const t = setInterval(() => {
      flushQuote()
    }, 10_000)
    return () => {
      clearInterval(t)
    }
  }, [books, data.reportYearly.books])

  const defaultBgImage = useBackgroundImage()

  if (!searchParams) {
    return null
  }

  return (
    <div
      className='w-full anna-page-container flex justify-center items-center h-min-screen bg-no-repeat bg-cover bg-center'
    >
      <Head>
        <title>{`${data?.reportYearly.user.name} 的 ${year} 年读书数据`}</title>
        <OGWithReport data={data} year={year} books={books} />
        {books.map(x => (
          <link key={x.id} as='image' rel='preload' href={x.image} />
        ))}
      </Head>
      <div className='w-full min-h-screen backdrop-blur-xl bg-gray-400 dark:bg-gray-900 dark:bg-opacity-80 bg-opacity-60'>
        <PageContainer bgImage={defaultBgImage}>
          <div className=' container relative min-h-screen flex items-center flex-col justify-center'>
            <ReportHero
              books={books}
              clippings={data.reportYearly.books ?? []}
            />
            <div className=' flex justify-center flex-col text-center'>
              <Avatar
                img={data?.reportYearly.user.avatar ?? ''}
                name={data?.reportYearly.user.name}
                className='w-24 h-24 mx-auto'
              />
              <span className='text-2xl dark:text-gray-200 my-4 xl:my-10'>{data?.reportYearly.user.name}</span>
              <p className='text-2xl dark:text-gray-200 w-full text-center mb-4'>
                {year === (new Date().getFullYear()) ? '今' : year}年共读了 {data?.reportYearly.books.length} 本书
              </p>
            </div>
            <Divider />
            <a
              className='flex justify-between items-center w-full absolute bottom-10 left-0 right-0 px-8 lg:px-0'
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

          </div>
        </PageContainer>
        <div className='w-full'>
          {books.map(b => (
            <PageContainer
              key={b.id}
              bgImage={b.image}
            >
              <ReportBookSection
                book={b}
                reportDataBook={data.reportYearly.books.find(x => x.doubanId === b.doubanId.toString())}
              />
            </PageContainer>
          ))}
        </div>

        <PageContainer>
          <div>
            <h2 className='text-gray-700 text-xl lg:text-3xl 2xl:text-6xl dark:text-gray-200 mb-8 text-center'>{t('app.slogan')}</h2>
            <p className='text-sm lg:text-lg 2xl:text-xl text-gray-700 dark:text-gray-500 w-full text-center px-8'>
              使用电脑浏览器打开
              <a
                href="https://clippingkk.annatarhe.com"
                className='text-gray-700 dark:text-gray-200 mx-2 hover:underline'
              >
                https://clippingkk.annatarhe.com
                <ArrowTopRightOnSquareIcon className=' w-4 h-4 inline-block ml-1 mb-4' />
              </a>
              拖入 kindle 文件即可同步
            </p>
          </div>
        </PageContainer>
      </div>
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
