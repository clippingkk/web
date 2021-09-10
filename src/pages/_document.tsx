import React from 'react'
import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document'

class DocumentTop extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)
    return initialProps
  }
  render() {
    return (
      <Html>
        <Head>
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta name="description" content="" />
          <meta name="keywords" content="" />
          <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui" />
          <meta name="renderer" content="webkit" />
          <meta httpEquiv="Cache-Control" content="no-siteapp" />
          {React.createElement('meta', {
            name: 'theme-color',
            content: 'rgba(33, 150, 243, 0.9)',
            media: '(prefers-color-scheme: light)'
          })}
          {React.createElement('meta', {
            name: 'theme-color',
            content: 'rgba(33, 150, 243, 0.9)',
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
          {/* <title>title here</title> */}
          <link href="https://cdn.annatarhe.com" rel='preconnect' crossOrigin='true' />
          <link href="https://ck-cdn.annatarhe.cn" rel='preconnect' crossOrigin='true' />
          <link href="https://clippingkk-api.annatarhe.com" rel='preconnect' crossOrigin='true' />
          <link href="https://wenqu.annatarhe.cn" rel='preconnect' crossOrigin='true' />
          <link href="https://bam.nr-data.net" rel="preconnect" crossOrigin='true' />

          <link rel="icon" type="image/png" sizes="32x32" href="https://cdn.annatarhe.com/annatarhe/kindle/fav/favicon-32x32.png-thumbnails" />
          <link rel="icon" type="image/png" sizes="16x16" href="https://cdn.annatarhe.com/annatarhe/kindle/fav/favicon-16x16.png-thumbnails" />
        </Head>
        <body>
          <Main />
          {/* <div id="app"></div> */}
          <div id="dialog"></div>
          <div id="toast"></div>
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default DocumentTop
