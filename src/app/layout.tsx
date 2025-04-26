import '../styles/devices.min.css'
import 'react-phone-input-2/lib/style.css'
// import 'emoji-mart/css/emoji-mart.css'
import '../styles/react-animation.css'
import '../styles/global.css'
import '../styles/effect-glow.css'
import '../styles/tailwind.css'
import '../styles/cmdk-raycast.css'

import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/code-highlight/styles.css'
// next.js not allow to use modern css. just remove it when next.js support it
// import '@annatarhe/lake-ui/style.css'

import '../prefers-dark'
import '../utils/settings'
import '../utils/locales'
import { Toaster } from 'react-hot-toast'
import React from 'react'
import { CDN_DEFAULT_DOMAIN } from '../constants/config'
import ClientOnlyProviders from './providers'
import { Metadata } from 'next'
import Script from 'next/script'
import { metadata as indexPageMetadata } from '../components/og/og-with-index'
import { Lato } from 'next/font/google'
import { ColorSchemeScript, MantineProvider } from '@mantine/core'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { theme } from '../styles/mantine'
import { colorSchemeManager } from '../hooks/theme'
import { cookies } from 'next/headers'
import GlobalUpload from '@/components/uploads/global'
// import localFont from 'next/font/local'

const lato = Lato({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lato',
  weight: ['100', '300', '400', '700', '900']
})

// const lxgw = localFont({
//   src: [{
//     path: '../src/assets/fonts/LXGWWenKai-Light.woff2',
//     weight: '200',
//   }, {
//     path: '../src/assets/fonts/LXGWWenKai-Regular.woff2',
//     weight: '400'
//   }, {
//     path: '../src/assets/fonts/LXGWWenKai-Bold.woff2',
//     weight: '700'
//   }],
//   display: 'swap',
//   variable: '--font-lxgw',
//   fallback: ['Helvetica']
// })


const faviconPrefix = `${CDN_DEFAULT_DOMAIN}/favicon`
type LayoutProps = {
  children: React.ReactElement
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'rgba(33, 150, 243, 0.9)' },
    { media: '(prefers-color-scheme: dark)', color: 'rgba(30, 34, 31, 0.9)' },
  ],
}

export const metadata: Metadata = {
  ...indexPageMetadata,
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

// maybe try: https://github.com/vercel/next.js/issues/48356
// TODO:

// <link href="https://cdn.annatarhe.com" rel='preconnect' crossOrigin='use-credentials' />
// <link href="https://ck-cdn.annatarhe.cn" rel='preconnect' crossOrigin='use-credentials' />
// <link href="https://clippingkk-api.annatarhe.com" rel='preconnect' crossOrigin='use-credentials' />
// <link href="https://wenqu.annatarhe.cn" rel='preconnect' crossOrigin='use-credentials' />
// <link href="https://bam.nr-data.net" rel="preconnect" crossOrigin='use-credentials' />
// ReactDOM.preconnect('https://cdn.annatarhe.com', { crossOrigin: 'use-credentials' })

async function Layout(props: LayoutProps) {
  const cs = await cookies()
  const token = cs.get('token')?.value
  const uid = cs.get('uid')?.value

  // const loggedInfo = (uid && token) ? await cloakSSROnlySecret(JSON.stringify({ uid: ~~uid, token }), RSC_LOGGED_INFO_KEY) : '{}'

  return (
    <html
      className={`${lato.variable}`}
      style={{
        '--font-lxgw': 'LxgwWenKai',
      } as React.CSSProperties}
    >
      <head>
        <ColorSchemeScript />
      </head>
      <Script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "2cea4dd03c8441d5a8d4f9499b303cb6"}' />
      <body>
        <MantineProvider theme={theme} colorSchemeManager={colorSchemeManager}>
          <ClientOnlyProviders loggedInfo={{ token, uid: uid ? ~~uid : undefined }}>
            <>
              {props.children}
              <div id="dialog"></div>
              <div id="toast"></div>
              <div id='searchbar' className='raycast'></div>
              <GlobalUpload uid={uid ? ~~uid : undefined} />
              <Toaster
                position='top-center'
              />
              <ReactQueryDevtools initialIsOpen={false} />
              <div data-id='modal' />
              <div data-st-role='modal' />
              <div data-st-role='tooltip' />
            </>
          </ClientOnlyProviders>
        </MantineProvider>
      </body>
    </html>
  )
}

export default Layout
