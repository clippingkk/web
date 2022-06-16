import React, { ReactElement, ReactNode, useEffect } from 'react'
import App from 'next/app'
import type { AppProps, AppContext } from 'next/app'
import { ApolloProvider } from '@apollo/client'
import { SWRConfig } from 'swr'
import { Provider } from 'react-redux'
import { ToastContainer } from 'react-toastify'

import '../utils/mixpanel'
import '../utils/sentry'

import AppContainer from '../components/AppContainer'
import { client, request } from '../services/ajax'
import store from '../store/index'

import 'react-toastify/dist/ReactToastify.css'
import 'react-phone-input-2/lib/style.css'
// import 'emoji-mart/css/emoji-mart.css'
import '../styles/react-animation.css'
import '../styles/global.css'
import '../styles/tailwind.css'

import '../prefers-dark'
import '../utils/locales'
import '../utils/leancloud'
import { initParseFromLS } from '../store/user/user'
import { AUTH_LOGIN } from '../store/user/type'
import { appWithTranslation } from 'next-i18next'
import { NextPage } from 'next'

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

  // useSSR((window as any).initialI18nStore, (window as any).initialLanguage)

  const content = getLayout(<Component {...pageProps} />)
  return (
    <Provider store={store}>
      <SWRConfig
        value={{
          fetcher: request
        }}
      >
        <ApolloProvider client={client}>
          <AppContainer>
            {content}
          </AppContainer>
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
