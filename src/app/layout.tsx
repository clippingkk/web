import 'react-phone-input-2/lib/style.css'
import '../styles/devices.min.css'
// import 'emoji-mart/css/emoji-mart.css'
import '../styles/cmdk-raycast.css'
import '../styles/effect-glow.css'
import '../styles/global.css'
import '../styles/react-animation.css'
import '../styles/tailwind.css'

// next.js not allow to use modern css. just remove it when next.js support it
// import '@annatarhe/lake-ui/style.css'

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { Metadata } from 'next'
import { Lato } from 'next/font/google'
import Script from 'next/script'
import type React from 'react'
import { Suspense } from 'react'
import { Toaster } from 'react-hot-toast'
import GlobalUpload from '@/components/uploads/global'
import { metadata as indexPageMetadata } from '../components/og/og-with-index'
import { CDN_DEFAULT_DOMAIN } from '../constants/config'
import '../prefers-dark'
import '../utils/locales'
import '../utils/settings'
import ClientOnlyProviders from './providers'

// import localFont from 'next/font/local'

const lato = Lato({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lato',
  weight: ['100', '300', '400', '700', '900'],
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
  children: React.ReactNode
}

export const viewport = {
  themeColor: [
    {
      media: '(prefers-color-scheme: light)',
      color: 'rgba(33, 150, 243, 0.9)',
    },
    { media: '(prefers-color-scheme: dark)', color: 'rgba(30, 34, 31, 0.9)' },
  ],
}

export const metadata: Metadata = {
  ...indexPageMetadata,
  icons: {
    apple: `${faviconPrefix}/apple-icon-180x180.png`,
    icon: `${faviconPrefix}/android-icon-192x192.png`,
  },
  manifest: `${faviconPrefix}/manifest.json`,
  other: {
    'msapplication-TileColor': '#ffffff',
    'msapplication-TileImage': `${faviconPrefix}/ms-icon-144x144.png`,
  },
}

async function Layout(props: LayoutProps) {
  // const loggedInfo = (uid && token) ? await cloakSSROnlySecret(JSON.stringify({ uid: ~~uid, token }), RSC_LOGGED_INFO_KEY) : '{}'

  return (
    <html
      className={`${lato.variable} dark`}
      style={
        {
          '--font-lxgw': 'LxgwWenKai',
        } as React.CSSProperties
      }
    >
      <Script
        defer
        src='https://static.cloudflareinsights.com/beacon.min.js'
        data-cf-beacon='{"token": "2cea4dd03c8441d5a8d4f9499b303cb6"}'
      />
      <body>
        <Suspense fallback={<div className='min-h-screen' />}>
          <ClientOnlyProviders>
            {props.children}
            <div id='dialog'></div>
            <div id='toast'></div>
            <div id='searchbar' className='raycast'></div>
            <GlobalUpload />
            <Toaster position='top-center' />
            <ReactQueryDevtools initialIsOpen={false} />
            <div data-id='modal' />
            <div data-st-role='modal' />
            <div data-st-role='tooltip' />
          </ClientOnlyProviders>
        </Suspense>
      </body>
    </html>
  )
}

export default Layout
