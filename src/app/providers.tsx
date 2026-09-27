'use client'

import { ApolloNextAppProvider } from '@apollo/client-integration-nextjs'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type React from 'react'
import { useState, useEffect } from 'react'

import ThemeSync from '@/components/theme/theme-sync'

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
    <QueryClientProvider client={rq}>
      <ApolloNextAppProvider makeClient={makeApolloClient}>
        <ThemeSync />
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </ApolloNextAppProvider>
    </QueryClientProvider>
  )
}

export default ClientOnlyProviders
