import '@fontsource/literata/400.css'
import '@fontsource/literata/400-italic.css'
import '@fontsource/literata/600.css'
import '@fontsource/literata/700.css'
import 'lxgw-wenkai-webfont/lxgwwenkai-regular.css'
import 'lxgw-wenkai-webfont/lxgwwenkai-bold.css'
import '../styles/global.css'
import '../styles/tailwind.css'
import '../styles/legacy-scale.css'
import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import type React from 'react'
import { Suspense } from 'react'

import AppToaster from '@/components/app-toaster'
import GlobalUpload from '@/components/uploads/global'
import { bootScript, SERVER_THEME } from '@/lib/theme'

import { metadata as indexPageMetadata } from '../components/og/og-with-index'
import { CDN_DEFAULT_DOMAIN } from '../constants/config'
import Loading from './loading'
import ClientOnlyProviders from './providers'

const faviconPrefix = `${CDN_DEFAULT_DOMAIN}/favicon`
type LayoutProps = {
  children: React.ReactNode
}

export const viewport: Viewport = {
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F5F0' },
    { media: '(prefers-color-scheme: dark)', color: '#141311' },
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

function Layout(props: LayoutProps) {
  return (
    <html
      lang="en"
      className={SERVER_THEME === 'dark' ? 'dark' : undefined}
      data-theme={SERVER_THEME}
      suppressHydrationWarning
    >
      <head>
        {/* applies the stored theme and language before first paint */}
        <script dangerouslySetInnerHTML={{ __html: bootScript() }} />
      </head>
      <body className="bg-lake-canvas text-lake-fg font-sans">
        <Script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "2cea4dd03c8441d5a8d4f9499b303cb6"}'
        />
        <Suspense fallback={<Loading />}>
          <ClientOnlyProviders>
            {props.children}
            <GlobalUpload />
            <AppToaster />
            <div data-st-role="modal" />
            <div data-st-role="sheet" data-ui-scale="standard" />
            <div data-st-role="popover" data-ui-scale="standard" />
            <div data-st-role="tooltip" />
            <div data-id="modal" />
          </ClientOnlyProviders>
        </Suspense>
      </body>
    </html>
  )
}

export default Layout
