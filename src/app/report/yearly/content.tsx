'use client'
import Image from 'next/image'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Avatar from '../../../components/avatar/avatar'
import { WenquBook } from '../../../services/wenqu'
import logo from '../../../assets/logo.png'
import ReportBookSection from '../../../components/reports/report-book-section'
import { Blockquote, Divider } from '@mantine/core'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import ReportHero from '../../../components/reports/report-hero'
import { useBackgroundImage } from '../../../hooks/theme'
import { Clipping, FetchYearlyReportQuery } from '../../../schema/generated'
import { useMultipBook } from '../../../hooks/book'

type PageContainerProps = {
  bgImage?: string | { src: string, blurHash: string }
  children: React.ReactElement
}

function PageContainer(props: PageContainerProps) {
  const containerStyle = useMemo<React.CSSProperties | undefined>(() => {
    let backgroundImage: string | undefined
    let bgImg = props.bgImage
    if (!bgImg) {
      return undefined
    }
    if (typeof bgImg === 'string') {
      backgroundImage = `url(${bgImg})`;
    }

    if (typeof bgImg === 'object') {
      backgroundImage =  `url(${bgImg.src})`;
    }
    return {
      backgroundImage
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
type ReportYearlyProps = {
  uid: number
  year: number
  reportInfoServerData: FetchYearlyReportQuery
  dbIds: string[]
}

function ReportYearly(props: ReportYearlyProps) {
  const { year, dbIds, reportInfoServerData: data} = props

  const { books } = useMultipBook(dbIds)
  const { t } = useTranslation()

  const [randomQuote, setRandomQuote] = useState<{ book: WenquBook, clipping: Pick<Clipping, 'id' | 'content'> } | null>(null)

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

  const metaTitle = `${data?.reportYearly.user.name} 在 ${year} 年共读了 ${data?.reportYearly.books.length} 本书 - Clippingkk - kindle 书摘管理`

  return (
    <div
      className='w-full anna-page-container flex justify-center items-center h-min-screen bg-no-repeat bg-cover bg-center'
    >
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

export default ReportYearly
