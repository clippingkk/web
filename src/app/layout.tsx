import '../styles/devices.min.css'
import 'react-phone-input-2/lib/style.css'
// import 'emoji-mart/css/emoji-mart.css'
import '../styles/react-animation.css'
import '../styles/global.css'
import '../styles/tailwind.css'
import '../styles/cmdk-raycast.css'

import { MantineProvider, ColorSchemeProvider, ColorScheme } from '@mantine/core'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Provider as JotaiProvider } from 'jotai'
import type { AppProps, AppContext } from 'next/app'
import { ApolloProvider } from '@apollo/client'
import { Provider } from 'react-redux'

import AppContainer from '../components/AppContainer'
import { client, reactQueryClient, request } from '../services/ajax'
import store from '../store/index'

import '../prefers-dark'
import '../utils/locales'
import '../utils/leancloud'
import { initParseFromLS } from '../store/user/user'
import { AUTH_LOGIN } from '../store/user/type'
import { NextPage } from 'next'
import { Toaster } from 'react-hot-toast'
import { useDarkModeStatus } from '../hooks/theme'
import { reactQueryPersister } from '../services/storage'
import React, { useEffect } from 'react'
import { useLayoutInit } from '../hooks/init'
import { CDN_DEFAULT_DOMAIN } from '../constants/config'

type LayoutProps = {
  children: React.ReactElement
}

const faviconPrefix = `${CDN_DEFAULT_DOMAIN}/favicon`
function Layout(props: LayoutProps) {
  const { isDarkTheme, onDarkThemeChange } = useDarkModeStatus()
  useLayoutInit()
  return (
    <html>
      {/* <Head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="renderer" content="webkit" />
        <meta httpEquiv="Cache-Control" content="no-siteapp" />
        {React.createElement('meta', {
          name: 'theme-color',
          content: 'rgba(33, 150, 243, 0.9)',
          media: '(prefers-color-scheme: light)'
        })}
        {React.createElement('meta', {
          name: 'theme-color',
          content: 'rgba(30, 34, 31, 0.9)',
          media: '(prefers-color-scheme: dark)'
        })}
        <link href="https://cdn.annatarhe.com" rel='preconnect' crossOrigin='use-credentials' />
        <link href="https://ck-cdn.annatarhe.cn" rel='preconnect' crossOrigin='use-credentials' />
        <link href="https://clippingkk-api.annatarhe.com" rel='preconnect' crossOrigin='use-credentials' />
        <link href="https://wenqu.annatarhe.cn" rel='preconnect' crossOrigin='use-credentials' />
        <link href="https://bam.nr-data.net" rel="preconnect" crossOrigin='use-credentials' />

        <link rel="apple-touch-icon" sizes="57x57" href={faviconPrefix + "/apple-icon-57x57.png"} />
        <link rel="apple-touch-icon" sizes="60x60" href={faviconPrefix + "/apple-icon-60x60.png"} />
        <link rel="apple-touch-icon" sizes="72x72" href={faviconPrefix + "/apple-icon-72x72.png"} />
        <link rel="apple-touch-icon" sizes="76x76" href={faviconPrefix + "/apple-icon-76x76.png"} />
        <link rel="apple-touch-icon" sizes="114x114" href={faviconPrefix + "/apple-icon-114x114.png"} />
        <link rel="apple-touch-icon" sizes="120x120" href={faviconPrefix + "/apple-icon-120x120.png"} />
        <link rel="apple-touch-icon" sizes="144x144" href={faviconPrefix + "/apple-icon-144x144.png"} />
        <link rel="apple-touch-icon" sizes="152x152" href={faviconPrefix + "/apple-icon-152x152.png"} />
        <link rel="apple-touch-icon" sizes="180x180" href={faviconPrefix + "/apple-icon-180x180.png"} />
        <link rel="icon" type="image/png" sizes="192x192" href={faviconPrefix + "/android-icon-192x192.png"} />
        <link rel="icon" type="image/png" sizes="32x32" href={faviconPrefix + "/favicon-32x32.png"} />
        <link rel="icon" type="image/png" sizes="96x96" href={faviconPrefix + "/favicon-96x96.png"} />
        <link rel="icon" type="image/png" sizes="16x16" href={faviconPrefix + "/favicon-16x16.png"} />
        <link rel="manifest" href={faviconPrefix + "/manifest.json"} />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content={faviconPrefix + "/ms-icon-144x144.png"} />
        <script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "2cea4dd03c8441d5a8d4f9499b303cb6"}' />
      </Head> */}
      <body>
        {/* <div id="app"></div> */}
        <JotaiProvider>
          <Provider store={store}>
            <ColorSchemeProvider
              colorScheme={isDarkTheme ? 'dark' : 'light'}
              toggleColorScheme={t => {
                onDarkThemeChange(t === 'dark')
              }}
            >
              <MantineProvider theme={{ colorScheme: isDarkTheme ? 'dark' : 'light' }}>
                <PersistQueryClientProvider
                  client={reactQueryClient}
                  persistOptions={{
                    persister: reactQueryPersister
                  }}
                >
                  <ApolloProvider client={client}>
                    <AppContainer>
                      <>
                        {props.children}
                        <div id="dialog"></div>
                        <div id="toast"></div>
                        <div id='searchbar' className='raycast'></div>
                      </>
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
      </body>
    </html>
  )
}

export default Layout
