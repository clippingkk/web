import React from 'react'
import { SubscriptionStatus, FetchOrdersQuery, FetchOrdersQueryVariables, FetchOrdersDocument } from '@/schema/generated'
import { useTranslation } from '@/i18n'
import Link from 'next/link'
import SubscriptionContent from './content'
import CancelButton from './cancel-button'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getApolloServerClient } from '@/services/apollo.server'
import { CreditCard, Receipt } from 'lucide-react'

type Props = {
  params: Promise<{ userid: string }>
}

async function OrdersTable(props: Props) {

  const [params, ck, { t }] = await Promise.all([props.params, cookies(), useTranslation()])
  const { userid } = params
  const myUid = ck.get('uid')?.value

  if (!myUid) {
    return redirect(`/dash/${userid}/profile`)
  }

  const myUidInt = myUid ? parseInt(myUid) : undefined

  const apolloClient = getApolloServerClient()

  const uid = myUidInt

  const { data: orderList } = await apolloClient.query<FetchOrdersQuery, FetchOrdersQueryVariables>({
    query: FetchOrdersDocument,
    fetchPolicy: 'network-only',
    variables: {
      id: uid
    },
    context: {
      headers: {
        'Authorization': 'Bearer ' + ck.get('token')?.value
      },
    }
  })

  return (
    <div className='w-full px-4 md:px-8 lg:px-12 max-w-6xl mx-auto'>
      <div className='mb-8'>
        <div className='flex items-center mb-2'>
          <Receipt className='w-5 h-5 text-indigo-500 dark:text-indigo-400 mr-2' />
          <h2 className='text-2xl font-bold text-slate-800 dark:text-slate-200'>
            {t('app.settings.orders.title')}
          </h2>
        </div>
        <p className='text-slate-600 dark:text-slate-400 mb-6'>
          {t('app.settings.orders.description')}
        </p>
        
        {orderList?.me.orderList.length === 0 && (
          <div className='flex flex-col items-center justify-center py-12 px-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 dark:border-slate-700'>
            <CreditCard className='w-12 h-12 text-slate-400 dark:text-slate-600 mb-4' />
            <p className='text-lg font-medium text-slate-700 dark:text-slate-300 mb-2'>
              {t('app.settings.orders.empty')}
            </p>
            <p className='text-slate-500 dark:text-slate-400 text-center mb-6 max-w-md'>
              {t('app.settings.orders.emptyDescription')}
            </p>
            <Link 
              href='/pricing' 
              className='inline-flex items-center justify-center px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-sm transition-transform active:scale-95'
            >
              {t('app.plan.premium.goto')}
            </Link>
          </div>
        )}
      </div>
      
      {(orderList?.me.orderList ?? []).length > 0 && (
        <div className='space-y-8'>
          {orderList?.me.orderList.map(o => (
            <div key={o.id} className='with-fade-in bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700'>
              <div className='flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:p-6 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700'>
                <div className='flex items-center mb-4 md:mb-0'>
                  <div className='flex flex-col'>
                    <div className='flex items-center'>
                      <h3 className='text-lg font-medium text-slate-800 dark:text-slate-200 mr-3'>
                        {t('app.settings.orders.subscription')}
                      </h3>
                      <div className='font-mono text-sm text-slate-500 dark:text-slate-400'>
                        {o.subscriptionId}
                      </div>
                    </div>
                    <div className='mt-1'>
                      <span 
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${o.status === SubscriptionStatus.Active ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300' : 
                          o.status === SubscriptionStatus.Pending ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' : 
                          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}
                      >
                        {o.status}
                      </span>
                    </div>
                  </div>
                </div>
                <CancelButton subscriptionId={o.subscriptionId} status={o.status} />
              </div>
              <div className='p-0 md:p-0'>
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
