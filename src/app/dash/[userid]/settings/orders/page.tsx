import { CreditCard, Receipt } from 'lucide-react'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { COOKIE_TOKEN_KEY, USER_ID_KEY } from '@/constants/storage'
import { getTranslation } from '@/i18n'
import {
  FetchOrdersDocument,
  type FetchOrdersQuery,
  type FetchOrdersQueryVariables,
  SubscriptionStatus,
} from '@/schema/generated'
import { getApolloServerClient } from '@/services/apollo.server'

import CancelButton from './cancel-button'
import SubscriptionContent from './content'

type Props = {
  params: Promise<{ userid: string }>
}

async function OrdersTable(props: Props) {
  const [params, ck, { t }] = await Promise.all([
    props.params,
    cookies(),
    getTranslation(),
  ])
  const { userid } = params
  const myUid = ck.get(USER_ID_KEY)?.value

  if (!myUid) {
    return redirect(`/dash/${userid}/profile`)
  }

  const myUidInt = myUid ? parseInt(myUid, 10) : undefined

  const apolloClient = getApolloServerClient()

  const uid = myUidInt

  const { data: orderList } = await apolloClient.query<
    FetchOrdersQuery,
    FetchOrdersQueryVariables
  >({
    query: FetchOrdersDocument,
    fetchPolicy: 'network-only',
    variables: {
      id: uid,
    },
    context: {
      headers: {
        Authorization: `Bearer ${ck.get(COOKIE_TOKEN_KEY)?.value}`,
      },
    },
  })

  return (
    <div className="mx-auto w-full max-w-6xl px-4 md:px-8 lg:px-12">
      <div className="mb-8">
        <div className="mb-2 flex items-center">
          <Receipt className="mr-2 h-5 w-5 text-indigo-500 dark:text-indigo-400" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            {t('app.settings.orders.title')}
          </h2>
        </div>
        <p className="mb-6 text-slate-600 dark:text-slate-400">
          {t('app.settings.orders.description')}
        </p>

        {orderList?.me.orderList.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white/70 px-4 py-12 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/70">
            <CreditCard className="mb-4 h-12 w-12 text-slate-400 dark:text-slate-600" />
            <p className="mb-2 text-lg font-medium text-slate-700 dark:text-slate-300">
              {t('app.settings.orders.empty')}
            </p>
            <p className="mb-6 max-w-md text-center text-slate-500 dark:text-slate-400">
              {t('app.settings.orders.emptyDescription')}
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-6 py-2 font-medium text-white shadow-sm transition-transform hover:bg-indigo-700 active:scale-95"
            >
              {t('app.plan.premium.goto')}
            </Link>
          </div>
        )}
      </div>

      {(orderList?.me.orderList ?? []).length > 0 && (
        <div className="space-y-8">
          {orderList?.me.orderList.map((o) => (
            <div
              key={o.id}
              className="with-fade-in overflow-hidden rounded-lg border border-slate-200 bg-white/50 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/50"
            >
              <div className="flex flex-col items-start justify-between border-b border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:p-6 dark:border-slate-700 dark:bg-slate-800/80">
                <div className="mb-4 flex items-center md:mb-0">
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <h3 className="mr-3 text-lg font-medium text-slate-800 dark:text-slate-200">
                        {t('app.settings.orders.subscription')}
                      </h3>
                      <div className="font-mono text-sm text-slate-500 dark:text-slate-400">
                        {o.subscriptionId}
                      </div>
                    </div>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                          o.status === SubscriptionStatus.Active
                            ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300'
                            : o.status !== SubscriptionStatus.Incomplete
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {o.status}
                      </span>
                    </div>
                  </div>
                </div>
                <CancelButton
                  subscriptionId={o.subscriptionId}
                  status={o.status}
                />
              </div>
              <div className="p-0 md:p-0">
                <SubscriptionContent orders={o.orders} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrdersTable
