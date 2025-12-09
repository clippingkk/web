import { ArrowLeftCircle, ArrowRightCircle, BookOpenCheck } from 'lucide-react'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { COOKIE_TOKEN_KEY } from '@/constants/storage'
import { getTranslation } from '@/i18n'
import {
  UncheckBooksQueryDocument,
  type UncheckBooksQueryQuery,
  type UncheckBooksQueryQueryVariables,
} from '@/schema/generated'
import { getApolloServerClient } from '@/services/apollo.server'
import HomelessBooksTable from './content'

type PageProps = {
  params: Promise<{ userid: string }>
  searchParams: Promise<{ offset?: string }>
}

async function AdminPanel(props: PageProps) {
  const [ck, params, sp, { t }] = await Promise.all([
    cookies(),
    props.params,
    props.searchParams,
    getTranslation(),
  ])
  const uid = ~~params.userid

  const token = ck.get(COOKIE_TOKEN_KEY)

  const offset = sp.offset ? ~~sp.offset : 0

  const ac = getApolloServerClient()

  const { data } = await ac.query<
    UncheckBooksQueryQuery,
    UncheckBooksQueryQueryVariables
  >({
    query: UncheckBooksQueryDocument,
    variables: {
      pagination: {
        limit: 50,
        offset,
      },
    },
    context: {
      headers: {
        Authorization: `Bearer ${token?.value}`,
      },
    },
  })

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-6xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700'>
        <div className='py-8 px-8 bg-gradient-to-br from-blue-400 to-indigo-500 dark:from-blue-500 dark:to-indigo-600'>
          <div className='flex items-center justify-center gap-4 text-white'>
            <div className='p-2 bg-white/10 rounded-lg backdrop-blur-sm'>
              <BookOpenCheck className='h-8 w-8' />
            </div>
            <div className='text-center'>
              <h1 className='text-3xl font-bold'>{t('Homeless Books')}</h1>
              <p className='text-blue-100 dark:text-blue-200 text-sm mt-1'>
                {t('Manage and sync unprocessed book entries')}
              </p>
            </div>
          </div>
        </div>

        <div className='p-8'>
          <div className='flex justify-between items-center mb-8 flex-wrap gap-4'>
            <div className='flex items-center gap-2'>
              <div className='h-2 w-2 rounded-full bg-blue-400'></div>
              <span className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                {t('Showing books')} {offset + 1} -{' '}
                {offset + (data.adminDashboard.uncheckedBooks?.length || 0)}
              </span>
            </div>
            <div className='flex gap-3'>
              <Link
                href={`/dash/${uid}/admin?offset=${Math.max(0, offset - 50)}`}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 ${
                  offset <= 0
                    ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                aria-disabled={offset <= 0}
              >
                <ArrowLeftCircle className='h-4 w-4' />
                {t('Previous')}
              </Link>
              <Link
                href={`/dash/${uid}/admin?offset=${offset + 50}`}
                className='flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-400 hover:bg-blue-500 dark:bg-blue-400 dark:hover:bg-blue-500 transition-all duration-200 shadow-sm'
              >
                {t('Next')}
                <ArrowRightCircle className='h-4 w-4' />
              </Link>
            </div>
          </div>

          <HomelessBooksTable data={data.adminDashboard.uncheckedBooks ?? []} />

          <div className='mt-8 flex justify-center'>
            <Link
              href={`/dash/${uid}/admin?offset=${offset + 50}`}
              className='flex items-center gap-2 px-6 py-3 rounded-lg text-white bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 dark:from-blue-400 dark:to-blue-500 dark:hover:from-blue-500 dark:hover:to-blue-600 transition-all duration-200 shadow-sm hover:shadow-md font-medium'
            >
              {t('Load More Books')}
              <ArrowRightCircle className='h-5 w-5' />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
