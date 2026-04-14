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
    <section className="with-slide-in w-full">
      <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/70 shadow-sm backdrop-blur-xl dark:border-slate-800/40 dark:bg-slate-900/70">
        <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500 px-8 py-8">
          <div className="flex items-center justify-center gap-4 text-white">
            <div className="rounded-xl bg-white/15 p-2 ring-1 ring-white/20 backdrop-blur-sm">
              <BookOpenCheck className="h-7 w-7" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-semibold tracking-tight">
                {t('Homeless Books')}
              </h1>
              <p className="mt-1 text-sm text-blue-50">
                {t('Manage and sync unprocessed book entries')}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {t('Showing books')} {offset + 1} -{' '}
                {offset + (data!.adminDashboard.uncheckedBooks?.length || 0)}
              </span>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/dash/${uid}/admin?offset=${Math.max(0, offset - 50)}`}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  offset <= 0
                    ? 'cursor-not-allowed border-slate-200 text-slate-400 opacity-50 dark:border-slate-700 dark:text-slate-500'
                    : 'border-slate-200 text-slate-700 hover:border-blue-400/60 hover:bg-blue-400/5 dark:border-slate-700 dark:text-slate-200 dark:hover:border-blue-400/60 dark:hover:bg-blue-400/10'
                }`}
                aria-disabled={offset <= 0}
              >
                <ArrowLeftCircle className="h-4 w-4" />
                {t('Previous')}
              </Link>
              <Link
                href={`/dash/${uid}/admin?offset=${offset + 50}`}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-400 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-md dark:text-slate-950 dark:hover:bg-blue-300"
              >
                {t('Next')}
                <ArrowRightCircle className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <HomelessBooksTable
            data={data!.adminDashboard.uncheckedBooks ?? []}
          />

          <div className="mt-8 flex justify-center">
            <Link
              href={`/dash/${uid}/admin?offset=${offset + 50}`}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-400 px-6 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-md dark:text-slate-950 dark:hover:bg-blue-300"
            >
              {t('Load More Books')}
              <ArrowRightCircle className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdminPanel
