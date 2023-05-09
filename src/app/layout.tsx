import '../styles/devices.min.css'
import 'react-phone-input-2/lib/style.css'
// import 'emoji-mart/css/emoji-mart.css'
import '../styles/react-animation.css'
import '../styles/global.css'
import '../styles/tailwind.css'
import '../styles/cmdk-raycast.css'

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import AppContainer from '../components/AppContainer'

import '../prefers-dark'
import '../utils/locales'
import '../utils/leancloud'
import { Toaster } from 'react-hot-toast'
import { reactQueryPersister } from '../services/storage'
import React, { useEffect } from 'react'
import { CDN_DEFAULT_DOMAIN } from '../constants/config'
import ClientOnlyProviders from './providers';
import { Metadata } from 'next'
import Script from 'next/script'

const faviconPrefix = `${CDN_DEFAULT_DOMAIN}/favicon`
type LayoutProps = {
  children: React.ReactElement
}

export const metadata: Metadata = {
  'themeColor': [{
    media: '(prefers-color-scheme: light)',
    color: 'rgba(33, 150, 243, 0.9)'
  }, {
    media: '(prefers-color-scheme: dark)',
    color: 'rgba(30, 34, 31, 0.9)'
  }],
  icons: {
    // <link rel="apple-touch-icon" sizes="57x57" href={faviconPrefix + "/apple-icon-57x57.png"} />
    // <link rel="apple-touch-icon" sizes="60x60" href={faviconPrefix + "/apple-icon-60x60.png"} />
    // <link rel="apple-touch-icon" sizes="72x72" href={faviconPrefix + "/apple-icon-72x72.png"} />
    // <link rel="apple-touch-icon" sizes="76x76" href={faviconPrefix + "/apple-icon-76x76.png"} />
    // <link rel="apple-touch-icon" sizes="114x114" href={faviconPrefix + "/apple-icon-114x114.png"} />
    // <link rel="apple-touch-icon" sizes="120x120" href={faviconPrefix + "/apple-icon-120x120.png"} />
    // <link rel="apple-touch-icon" sizes="144x144" href={faviconPrefix + "/apple-icon-144x144.png"} />
    // <link rel="apple-touch-icon" sizes="152x152" href={faviconPrefix + "/apple-icon-152x152.png"} />
    // <link rel="apple-touch-icon" sizes="180x180" href={faviconPrefix + "/apple-icon-180x180.png"} />
    apple: `${faviconPrefix}/apple-icon-180x180.png`,
    // <link rel="icon" type="image/png" sizes="192x192" href={faviconPrefix + "/android-icon-192x192.png"} />
    // <link rel="icon" type="image/png" sizes="32x32" href={faviconPrefix + "/favicon-32x32.png"} />
    // <link rel="icon" type="image/png" sizes="96x96" href={faviconPrefix + "/favicon-96x96.png"} />
    // <link rel="icon" type="image/png" sizes="16x16" href={faviconPrefix + "/favicon-16x16.png"} />
    icon: `${faviconPrefix}//android-icon-192x192.png`,
  },
  manifest: `${faviconPrefix}/manifest.json`,

  // <link rel="manifest" href={faviconPrefix + "/manifest.json"} />
  // <meta name="msapplication-TileColor" content="#ffffff" />
  // <meta name="msapplication-TileImage" content={faviconPrefix + "/ms-icon-144x144.png"} />
  other: {
    'msapplication-TileColor': '#ffffff',
    'msapplication-TileImage': `${faviconPrefix}/ms-icon-144x144.png`,
  },
}

export function PreloadResources() {
  // maybe try: https://github.com/vercel/next.js/issues/48356
  // TODO:

  // <link href="https://cdn.annatarhe.com" rel='preconnect' crossOrigin='use-credentials' />
  // <link href="https://ck-cdn.annatarhe.cn" rel='preconnect' crossOrigin='use-credentials' />
  // <link href="https://clippingkk-api.annatarhe.com" rel='preconnect' crossOrigin='use-credentials' />
  // <link href="https://wenqu.annatarhe.cn" rel='preconnect' crossOrigin='use-credentials' />
  // <link href="https://bam.nr-data.net" rel="preconnect" crossOrigin='use-credentials' />
  // ReactDOM.preconnect('https://cdn.annatarhe.com', { crossOrigin: 'use-credentials' })
  return null;
}

const Layout = (props: LayoutProps) => {
  return (
    <html>
      <Script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "2cea4dd03c8441d5a8d4f9499b303cb6"}' />
      <body>
        {/* <div id="app"></div> */}
        <ClientOnlyProviders>
          <>
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
            <ReactQueryDevtools initialIsOpen={false} />
          </>
        </ClientOnlyProviders>
      </body>
    </html>
  )
}

export default Layout
