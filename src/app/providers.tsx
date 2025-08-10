'use client'
import '../utils/mixpanel'

import { ApolloNextAppProvider } from '@apollo/client-integration-nextjs'
import { MetaMaskProvider } from '@metamask/sdk-react'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import React from 'react'
import {
  getReactQueryClient,
  makeApolloClient,
} from '../services/ajax'
import { reactQueryPersister } from '../services/storage'

type ClientOnlyProvidersProps = {
  children: React.ReactNode
}

function ClientOnlyProviders(props: ClientOnlyProvidersProps) {
  const { children } = props
  const rq = getReactQueryClient()
  return (
    <MetaMaskProvider
      sdkOptions={{
        dappMetadata: {
          name: 'ClippingKK',
          url: typeof window === 'undefined' ? '' : window.location.href,
        },
        infuraAPIKey: process.env.infuraKey,
        // Other options.
      }}
    >
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
    </MetaMaskProvider>
  )
}

export default ClientOnlyProviders
