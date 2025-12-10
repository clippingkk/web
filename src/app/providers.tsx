'use client'

import { ApolloNextAppProvider } from '@apollo/client-integration-nextjs'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import type React from 'react'
import { useState } from 'react'
import { createReactQueryClient, makeApolloClient } from '../services/ajax'
import { reactQueryPersister } from '../services/storage'

type ClientOnlyProvidersProps = {
  children: React.ReactNode
}

function ClientOnlyProviders(props: ClientOnlyProvidersProps) {
  const { children } = props
  // Use useState to ensure QueryClient is created only once per client instance
  const [rq] = useState(() => createReactQueryClient())
  return (
    // <MetaMaskProvider
    //   sdkOptions={{
    //     dappMetadata: {
    //       name: 'ClippingKK',
    //       url: typeof window === 'undefined' ? '' : window.location.href,
    //     },
    //     infuraAPIKey: process.env.NEXT_PUBLIC_INFURA_KEY,
    //     // Other options.
    //   }}
    // >
      <PersistQueryClientProvider
        client={rq}
        persistOptions={{
          persister: reactQueryPersister,
        }}
      >
        <ApolloNextAppProvider makeClient={makeApolloClient}>
          {children}
        </ApolloNextAppProvider>
      </PersistQueryClientProvider>
    // </MetaMaskProvider>
  )
}

export default ClientOnlyProviders
