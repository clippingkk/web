import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import logo from '@/assets/logo.png'
import Avatar from '@/components/avatar/avatar'
import ReportBookSection from '@/components/reports/report-book-section'
import ReportHero from '@/components/reports/report-hero'
import { getTranslation } from '@/i18n'
import type { FetchYearlyReportQuery } from '@/schema/generated'
import type { WenquBook } from '@/services/wenqu'
import PageContainer from './page-container'

type ReportYearlyProps = {
  uid: number
  year: number
  reportInfoServerData: FetchYearlyReportQuery
  dbIds: string[]
  books: WenquBook[]
}

async function ReportYearly(props: ReportYearlyProps) {
  const { year, reportInfoServerData: data, books } = props
  const { t } = await getTranslation()

  return (
    <div className='anna-page-container h-min-screen flex w-full items-center justify-center bg-cover bg-center bg-no-repeat'>
      <div className='dark:bg-opacity-80 bg-opacity-60 min-h-screen w-full bg-gray-400 backdrop-blur-xl dark:bg-gray-900'>
        <PageContainer>
          <div className='container flex min-h-screen flex-col items-center justify-center'>
            <div className='w-full flex-1' />
            <ReportHero
              books={books}
              clippings={data.reportYearly.books ?? []}
            />
            <div className='flex flex-col justify-center text-center'>
              <Avatar
                img={data?.reportYearly.user.avatar ?? ''}
                name={data?.reportYearly.user.name}
                className='mx-auto h-24 w-24'
              />
              <span className='my-4 text-2xl xl:my-10 dark:text-gray-200'>
                {data?.reportYearly.user.name}
              </span>
              <p className='mb-4 w-full text-center text-2xl dark:text-gray-200'>
                {year === new Date().getFullYear() ? '今' : year}年共读了{' '}
                {data?.reportYearly.books.length} 本书
              </p>
            </div>
            <hr />
            <div className='w-full flex-1' />
            <a
              className='flex w-full items-center justify-around px-8 pb-4 lg:px-0'
              href='https://clippingkk.annatarhe.com'
            >
              <Image src={logo} alt='clippingkk logo' height={64} width={64} />
              <span className='ml-8 text-gray-700 dark:text-gray-200'>
                {t('app.slogan')}
              </span>
            </a>
          </div>
        </PageContainer>
        <div className='w-full'>
          {books.map((b) => (
            <PageContainer key={b.id} bgImage={b.image}>
              <ReportBookSection
                book={b}
                reportDataBook={data.reportYearly.books.find(
                  (x) => x.doubanId === b.doubanId.toString()
                )}
              />
            </PageContainer>
          ))}
        </div>

        <PageContainer>
          <div>
            <h2 className='mb-8 text-center text-xl font-bold text-gray-700 lg:text-3xl 2xl:text-6xl dark:text-gray-200'>
              {t('app.slogan')}
            </h2>
            <p className='w-full px-8 text-center text-sm text-gray-700 lg:text-lg 2xl:text-xl dark:text-gray-500'>
              {t('app.report.tips.pcOpen')}
              <a
                href='https://clippingkk.annatarhe.com'
                className='mx-2 text-gray-700 hover:underline dark:text-gray-200'
              >
                https://clippingkk.annatarhe.com
                <ArrowTopRightOnSquareIcon className='mb-4 ml-1 inline-block h-4 w-4' />
              </a>
              {t('app.report.tips.dropTxtToSync')}
            </p>
          </div>
        </PageContainer>
      </div>
    </div>
  )
}

export default ReportYearly
