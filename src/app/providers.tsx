'use client'
import '../utils/mixpanel'

import { useTranslation } from '@/i18n/client'
import { ApolloNextAppProvider } from '@apollo/client-integration-nextjs'
import { MetaMaskProvider } from '@metamask/sdk-react'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { Provider as JotaiProvider } from 'jotai'
import React from 'react'
import { I18nextProvider } from 'react-i18next'
import { usePointerUpdate } from '../hooks/pointer'
import {
  createReactQueryClient,
  makeApolloClientWithCredentials,
} from '../services/ajax'
import { reactQueryPersister } from '../services/storage'

type ClientOnlyProvidersProps = {
  loggedInfo: {
    token?: string
    uid?: number
  }
  children: React.ReactNode
}

function ClientOnlyProviders(props: ClientOnlyProvidersProps) {
  const { loggedInfo, children } = props
  const { i18n } = useTranslation()
  const rq = createReactQueryClient()
  usePointerUpdate()
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
      <I18nextProvider i18n={i18n}>
        <JotaiProvider>
          <PersistQueryClientProvider
            client={rq}
            persistOptions={{
              persister: reactQueryPersister,
            }}
          >
            <ApolloNextAppProvider
              makeClient={makeApolloClientWithCredentials(loggedInfo)}
            >
              {children}
            </ApolloNextAppProvider>
          </PersistQueryClientProvider>
        </JotaiProvider>
      </I18nextProvider>
    </MetaMaskProvider>
  )
}

export default ClientOnlyProviders
