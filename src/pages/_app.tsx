import React from 'react'
import App from 'next/app'
import type { AppProps, AppContext } from 'next/app'
import { ApolloProvider } from '@apollo/client'
import { SWRConfig } from 'swr'
import { Provider } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import { client, request } from '../services/ajax'
import store from '../store/index'

import 'react-toastify/dist/ReactToastify.css'
import 'emoji-mart/css/emoji-mart.css'
import '../styles/global.css'
import '../styles/tailwind.css'

import '../styles/icons'
import '../prefers-dark'
import '../utils/locales'
import '../utils/leancloud'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <SWRConfig
        value={{
          fetcher: request
        }}
      >
        <ApolloProvider client={client}>
          <Component {...pageProps} />
          <ToastContainer
            theme={'light'}
          />
        </ApolloProvider>
      </SWRConfig>
    </Provider>
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
