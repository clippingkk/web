import { redirect } from 'next/navigation'

import CheckoutButton from '@/components/pricing/checkout-button'
import { authHref } from '@/lib/auth-href'
import { subjectBillingPath } from '@/server/gate/billing'
import { gateRequest } from '@/server/gate/client'
import { gateConfig } from '@/server/gate/config'
import { currentUserId } from '@/server/gate/current'
export default async function OrdersPage(props: {
  params: Promise<{ userid: string }>
}) {
  const uid = await currentUserId()
  if (!uid)
    redirect(authHref(`/dash/${(await props.params).userid}/settings/orders`))
  const billing = await gateRequest<{
    subscriptions: {
      id: string
      status: string
      currentPeriodEnd: string | null
    }[]
  }>(
    `${await subjectBillingPath(uid)}?environmentId=${gateConfig().environmentId}`
  )
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Subscriptions</h1>
      {billing.subscriptions.length ? (
        <>
          <ul>
            {billing.subscriptions.map((subscription) => (
              <li key={subscription.id} className="rounded-xl border p-4">
                Premium — {subscription.status}
                {subscription.currentPeriodEnd && (
                  <p>
                    Current period ends{' '}
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString(
                      'en'
                    )}
                  </p>
                )}
              </li>
            ))}
          </ul>
          <CheckoutButton signedIn portal />
        </>
      ) : (
        <>
          <p>No subscriptions yet.</p>
          <CheckoutButton signedIn />
        </>
      )}
    </section>
  )
}
