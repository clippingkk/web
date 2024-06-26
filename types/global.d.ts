declare var __DEV__: boolean
declare var __VERSION__: string
declare var WebViewJavascriptBridge: any
declare var WVJBCallbacks: any

// graphql.d.ts file
declare module '*.graphql' {
  import { DocumentNode } from 'graphql'

  const value: DocumentNode
  export default value
}
declare module '*.yml' {
  const v: object
  export default v
}

declare module 'react-dark-mode-toggle';
declare module 'colorthief';
declare module '@emoji-mart/react';
declare module 'body-scroll-lock';
declare module 'iso-639-3-to-1';

declare global {
  interface Window {
    // ethereum: any
  }
}

