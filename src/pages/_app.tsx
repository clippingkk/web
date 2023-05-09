import '../styles/devices.min.css'
import 'react-phone-input-2/lib/style.css'
// import 'emoji-mart/css/emoji-mart.css'
import '../styles/react-animation.css'
import '../styles/global.css'
import '../styles/tailwind.css'
import '../styles/cmdk-raycast.css'

import React, { ReactElement, ReactNode, useEffect } from 'react'
import NextNProgress from 'nextjs-progressbar'
import { MantineProvider, ColorSchemeProvider, ColorScheme } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Provider as JotaiProvider } from 'jotai'
import App from 'next/app'
import type { AppProps, AppContext } from 'next/app'
import { ApolloProvider } from '@apollo/client'
import { Provider } from 'react-redux'

import '../utils/mixpanel'
import '../utils/sentry'
import '../utils/echarts'

import AppContainer from '../components/AppContainer'
import { client, reactQueryClient, request } from '../services/ajax'
import store from '../store/index'

import '../prefers-dark'
import '../utils/locales'
import '../utils/leancloud'
import { AUTH_LOGIN } from '../store/user/type'
import { NextPage } from 'next'
import { Toaster } from 'react-hot-toast'
import { useDarkModeStatus } from '../hooks/theme'
import { reactQueryPersister } from '../services/storage'
import { initParseFromLS } from '../utils/storage'

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout || ((page: any) => page)
  useEffect(() => {
    const nt = initParseFromLS()
    // 初次加载
    if (nt) {
      store.dispatch({ type: AUTH_LOGIN, token: nt.token, profile: nt.profile })
    }
  }, [])


  const { isDarkTheme, onDarkThemeChange } = useDarkModeStatus()
  // useSSR((window as any).initialI18nStore, (window as any).initialLanguage)

  const content = getLayout(<Component {...pageProps} />)
  return (
    <JotaiProvider>
      <Provider store={store}>
        <ColorSchemeProvider
          colorScheme={isDarkTheme ? 'dark' : 'light'}
          toggleColorScheme={t => {
            onDarkThemeChange(t === 'dark')
          }}
        >
          <MantineProvider theme={{ colorScheme: isDarkTheme ? 'dark' : 'light' }}>
            <Notifications />
            <PersistQueryClientProvider
              client={reactQueryClient}
              persistOptions={{
                persister: reactQueryPersister
              }}
            >
              <ApolloProvider client={client}>
                <NextNProgress />
                <AppContainer>
                  {content}
                </AppContainer>
                <Toaster
                  position='top-center'
                />
              </ApolloProvider>
              <ReactQueryDevtools initialIsOpen={false} />
            </PersistQueryClientProvider>
          </MantineProvider>
        </ColorSchemeProvider>
      </Provider>
    </JotaiProvider>
  )
}

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
MyApp.getInitialProps = async (appContext: AppContext) => {
  // calls page's `getInitialProps` and fills `appProps.pageProps`
  const appProps = await App.getInitialProps(appContext);
  return { ...appProps }
}

export default MyApp
