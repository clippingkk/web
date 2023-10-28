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
import { createReactQueryClient, makeApolloClient } from '../services/ajax';
import { reactQueryPersister } from '../services/storage';
import { ApolloNextAppProvider } from '@apollo/experimental-nextjs-app-support/ssr';
import InitProvider from './init.provider';
import { I18nextProvider } from 'react-i18next';

type ClientOnlyProvidersProps = {
  children: React.ReactNode
}

function ClientOnlyProviders(props: ClientOnlyProvidersProps) {
  const { children } = props
  useDarkModeStatus()
  const cache = useGluedEmotionCache();
  const instance = init()
  const rq = createReactQueryClient()
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
                makeClient={makeApolloClient}
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
