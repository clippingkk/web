'use client'

import { MetaMaskProvider } from '@metamask/sdk-react'
import type React from 'react'

interface MetaMaskProviderWrapperProps {
  children: React.ReactNode
}

export default function MetaMaskProviderWrapper({
  children,
}: MetaMaskProviderWrapperProps) {
  return (
    <MetaMaskProvider
      sdkOptions={{
        dappMetadata: {
          name: 'ClippingKK',
          url: typeof window === 'undefined' ? '' : window.location.href,
        },
        infuraAPIKey: process.env.NEXT_PUBLIC_INFURA_KEY,
      }}
    >
      {children}
    </MetaMaskProvider>
  )
}
