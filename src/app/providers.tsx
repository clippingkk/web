'use client'

import { ApolloNextAppProvider } from '@apollo/client-integration-nextjs'
import { QueryClientProvider } from '@tanstack/react-query'
import type React from 'react'
import { useState, useEffect } from 'react'

import { createReactQueryClient, makeApolloClient } from '../services/ajax'
import profile from '../utils/profile'

type ClientOnlyProvidersProps = {
  children: React.ReactNode
}

function ClientOnlyProviders(props: ClientOnlyProvidersProps) {
  const { children } = props
  // Use useState to ensure QueryClient is created only once per client instance
  const [rq] = useState(() => createReactQueryClient())
  useEffect(() => {
    profile.onLogout()
  }, [])
  return (
    // <MetaMaskProvider
    //   sdkOptions={{
    //     dappMetadata: {
    //       name: 'ClippingKK',
    //       url: typeof window === 'undefined' ? '' : window.location.href,
    //     },
    //     infuraAPIKey: process.env.NEXT_PUBLIC_INFURA_KEY,
    //     // Other options.
    //   }}
    // >
    <QueryClientProvider client={rq}>
      <ApolloNextAppProvider makeClient={makeApolloClient}>
        {children}
      </ApolloNextAppProvider>
    </QueryClientProvider>
    // </MetaMaskProvider>
  )
}

export default ClientOnlyProviders
