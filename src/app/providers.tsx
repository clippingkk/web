'use client';
import '../utils/mixpanel'
import '../prefers-dark'
import '../utils/locales'
import '../utils/leancloud'

import { CacheProvider } from '@emotion/react';
import { ColorSchemeProvider, MantineProvider } from '@mantine/core';
import React from 'react'
import { Provider as JotaiProvider } from 'jotai'
import { useGluedEmotionCache } from '../hooks/emotion';
import { useLayoutInit } from '../hooks/init';
import { useDarkModeStatus } from '../hooks/theme';
import { Provider } from 'react-redux';
import store from '../store';
import { ApolloProvider } from '@apollo/client';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { reactQueryClient, client } from '../services/ajax';
import { reactQueryPersister } from '../services/storage';

type ClientOnlyProvidersProps = {
  children: React.ReactNode
}

function ClientOnlyProviders(props: ClientOnlyProvidersProps) {
  const { children } = props
  const { isDarkTheme, onDarkThemeChange } = useDarkModeStatus()
  useLayoutInit()

  const cache = useGluedEmotionCache();
  return (
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
                <ApolloProvider client={client}>
                  {/* <I18nextProvider i18n={{}}> */}
                  {children}
                  {/* </I18nextProvider> */}
                </ApolloProvider>
              </PersistQueryClientProvider>
            </MantineProvider>
          </CacheProvider>
        </ColorSchemeProvider>
      </Provider>
    </JotaiProvider>
  )
}

export default ClientOnlyProviders
