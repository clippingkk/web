/* eslint-disable @typescript-eslint/no-explicit-any */
declare let __DEV__: boolean
declare let __VERSION__: string
declare let WebViewJavascriptBridge: any
declare let WVJBCallbacks: any

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

interface Window {
  WebViewJavascriptBridge?: any
  WVJBCallbacks?: any
  AppleID?: {
    auth: {
      init: (options: {
        clientId: string;
        scope: string;
        redirectURI: string;
        state: string;
        usePopup: boolean;
      }) => void
      signIn(): Promise
    }
  }
  __APOLLO_STATE__?: Record<string, any>
}

