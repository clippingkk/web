import { connection } from 'next/server'

import { gateConfig } from '@/server/gate/config'

import AccountRemoveButton from './AccountRemoveButton'
export default async function Page() {
  await connection()

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold">Sign-in and security</h2>
        <p>
          Manage your verified email, password, and connected sign-in accounts
          in Gate.
        </p>
        <a href={`${gateConfig().baseUrl}/account`}>Manage Gate account</a>
      </section>
      <section>
        <h2 className="text-xl font-semibold">Delete ClippingKK account</h2>
        <p>
          Deletes your ClippingKK data and cancels ClippingKK subscriptions.
          Your shared Gate account and other products remain available.
        </p>
        <AccountRemoveButton />
      </section>
    </div>
  )
}
