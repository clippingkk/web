import React from 'react'
// eslint-disable-next-line @next/next/no-document-import-in-page
import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document'
import { CDN_DEFAULT_DOMAIN } from '../constants/config'

class DocumentTop extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)
    return initialProps
  }
  render() {
    const faviconPrefix = `${CDN_DEFAULT_DOMAIN}/favicon`

    return (
      <Html>
        <Head>
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
          {/* <meta
            name="theme-color"
            content="rgba(33, 150, 243, 0.9)"
            media="(prefers-color-scheme: light)"
          />
          <meta
            name="theme-color"
            content="rgba(33, 150, 243, 0.9)"
            media="(prefers-color-scheme: dark)"
          /> */}
          <link href="https://cdn.annatarhe.com" rel='preconnect' crossOrigin='true' />
          <link href="https://ck-cdn.annatarhe.cn" rel='preconnect' crossOrigin='true' />
          <link href="https://clippingkk-api.annatarhe.com" rel='preconnect' crossOrigin='true' />
          <link href="https://wenqu.annatarhe.cn" rel='preconnect' crossOrigin='true' />
          <link href="https://bam.nr-data.net" rel="preconnect" crossOrigin='true' />

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
        </Head>
        <body>
          <Main />
          {/* <div id="app"></div> */}
          <div id="dialog"></div>
          <div id="toast"></div>
          <div id='searchbar' className='raycast'></div>
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default DocumentTop
