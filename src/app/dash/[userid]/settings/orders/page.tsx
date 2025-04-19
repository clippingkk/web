import React from 'react'
import { SubscriptionStatus, FetchOrdersQuery, FetchOrdersQueryVariables, FetchOrdersDocument } from '@/schema/generated'
import { Badge, Button } from '@mantine/core'
import { useTranslation } from '@/i18n'
import Link from 'next/link'
import SubscriptionContent from './content'
import CancelButton from './cancel-button'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getApolloServerClient } from '@/services/apollo.server'

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
    <div className='w-full px-20'>
      {orderList?.me.orderList.length === 0 && (
        <div className='flex justify-center'>
          <Button
            component={Link}
            size='sm'
            href='/pricing'
            variant='gradient'
            gradient={{ from: 'indigo', to: 'cyan', deg: 105 }}
            className='active:scale-95'
          >
            {t('app.plan.premium.goto')}
          </Button>
        </div>
      )}
      {(orderList?.me.orderList ?? []).map(o => (
        <div key={o.id} className='with-fade-in'>
          <div className='flex justify-between'>
            <div className='flex items-center'>
              <h3 className='dark:text-gray-100 mr-2 ml-3'>{o.subscriptionId}</h3>
              <Badge color={o.status !== SubscriptionStatus.Canceled ? 'green' : undefined}>
                {o.status}
              </Badge>
            </div>
            <CancelButton subscriptionId={o.subscriptionId} status={o.status} />
          </div>
          <SubscriptionContent orders={o.orders} />
        </div>
      ))}
    </div>
  )
}

export default OrdersTable
