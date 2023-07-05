'use client';
import '../utils/mixpanel'
import '../prefers-dark'
import { init } from '../utils/locales'
import '../utils/leancloud'

import { CacheProvider } from '@emotion/react';
import { ColorSchemeProvider, MantineProvider } from '@mantine/core';
import React from 'react'
import { Provider as JotaiProvider } from 'jotai'
import { useGluedEmotionCache } from '../hooks/emotion';
import { useDarkModeStatus } from '../hooks/theme';
import { Provider } from 'react-redux';
import store from '../store';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { reactQueryClient, makeApolloClient } from '../services/ajax';
import { reactQueryPersister } from '../services/storage';
import { ApolloNextAppProvider } from '@apollo/experimental-nextjs-app-support/ssr';
import InitProvider from './init.provider';
import { I18nextProvider } from 'react-i18next';

type ClientOnlyProvidersProps = {
  children: React.ReactNode
}

function ClientOnlyProviders(props: ClientOnlyProvidersProps) {
  const { children } = props
  const { isDarkTheme, onDarkThemeChange } = useDarkModeStatus()
  const cache = useGluedEmotionCache();
  const instance = init()
  return (
    <I18nextProvider i18n={instance}>
      <JotaiProvider>
        <Provider store={store}>
          <ColorSchemeProvider
            colorScheme={isDarkTheme ? 'dark' : 'light'}
            toggleColorScheme={t => {
              onDarkThemeChange(t === 'dark')
            }}
          >
            <CacheProvider value={cache}>
              <MantineProvider theme={{ colorScheme: isDarkTheme ? 'dark' : 'light' }}>
                <PersistQueryClientProvider
                  client={reactQueryClient}
                  persistOptions={{
                    persister: reactQueryPersister
                  }}
                >
                  <ApolloNextAppProvider
                    makeClient={makeApolloClient}
                  >
                    {/* <I18nextProvider i18n={{}}> */}
                    <InitProvider>
                      {children}
                    </InitProvider>
                    {/* </I18nextProvider> */}
                  </ApolloNextAppProvider>
                </PersistQueryClientProvider>
              </MantineProvider>
            </CacheProvider>
          </ColorSchemeProvider>
        </Provider>
      </JotaiProvider>
    </I18nextProvider>
  )
}

export default ClientOnlyProviders
