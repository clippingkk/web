import { ArrowLeftCircle, ArrowRightCircle, BookOpenCheck } from 'lucide-react'
import { cookies } from 'next/headers'
import Link from 'next/link'
import React from 'react'
import { COOKIE_TOKEN_KEY } from '@/constants/storage'
import { useTranslation } from '@/i18n'
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
    useTranslation(),
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
        Authorization: 'Bearer ' + token?.value,
      },
    },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
        <div className="py-6 px-8 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700">
          <div className="flex items-center justify-center gap-3 text-white">
            <BookOpenCheck className="h-8 w-8" />
            <h1 className="text-2xl font-bold">{t('Homeless Books')}</h1>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t('Showing books')} {offset + 1} -{' '}
              {offset + (data.adminDashboard.uncheckedBooks?.length || 0)}
            </div>
            <div className="flex gap-4">
              <Link
                href={`/dash/${uid}/admin?offset=${Math.max(0, offset - 50)}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 ${offset <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-800'} transition duration-200`}
                aria-disabled={offset <= 0}
              >
                <ArrowLeftCircle className="h-4 w-4" />
                {t('Previous')}
              </Link>
              <Link
                href={`/dash/${uid}/admin?offset=${offset + 50}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 transition duration-200"
              >
                {t('Next')}
                <ArrowRightCircle className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <HomelessBooksTable data={data.adminDashboard.uncheckedBooks ?? []} />

          <div className="mt-8 flex justify-center">
            <Link
              href={`/dash/${uid}/admin?offset=${offset + 50}`}
              className="flex items-center gap-2 px-6 py-3 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 transition duration-200 shadow-md"
            >
              {t('Load More Books')}
              <ArrowRightCircle className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
