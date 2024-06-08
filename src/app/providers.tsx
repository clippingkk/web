'use client';
import '../utils/mixpanel'
import { init } from '../utils/locales'

import { CacheProvider } from '@emotion/react';
import React from 'react'
import { Provider as JotaiProvider } from 'jotai'
import { useGluedEmotionCache } from '../hooks/emotion';
import { useDarkModeStatus } from '../hooks/theme';
import { Provider } from 'react-redux';
import store from '../store';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createReactQueryClient, makeApolloClient, makeApolloClientWithCredentials } from '../services/ajax';
import { reactQueryPersister } from '../services/storage';
import { ApolloNextAppProvider } from '@apollo/experimental-nextjs-app-support';
import InitProvider from './init.provider';
import { I18nextProvider } from 'react-i18next';
import { usePointerUpdate } from '../hooks/pointer';

type ClientOnlyProvidersProps = {
  loggedInfo: {
    token?: string
    uid?: number
  }
  children: React.ReactNode
}

function ClientOnlyProviders(props: ClientOnlyProvidersProps) {
  const { loggedInfo, children } = props
  useDarkModeStatus()
  const cache = useGluedEmotionCache();
  const instance = init()
  const rq = createReactQueryClient()
  usePointerUpdate()
  return (
    <I18nextProvider i18n={instance}>
      <JotaiProvider>
        <Provider store={store}>
          <CacheProvider value={cache}>
            <PersistQueryClientProvider
              client={rq}
              persistOptions={{
                persister: reactQueryPersister
              }}
            >
              <ApolloNextAppProvider
                makeClient={makeApolloClientWithCredentials(loggedInfo)}
              >
                <InitProvider>
                  {children}
                </InitProvider>
              </ApolloNextAppProvider>
            </PersistQueryClientProvider>
          </CacheProvider>
        </Provider>
      </JotaiProvider>
    </I18nextProvider>
  )
}

export default ClientOnlyProviders
