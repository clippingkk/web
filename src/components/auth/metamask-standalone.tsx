'use client'
import { useSDK } from '@metamask/sdk-react'
import * as sentry from '@sentry/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { syncLoginStateToServer } from '@/actions/login'
import { COOKIE_TOKEN_KEY, USER_ID_KEY } from '@/constants/storage'
import { useAuthByWeb3LazyQuery } from '@/schema/generated'
import { updateToken } from '@/services/ajax'
import profile from '@/utils/profile'
import { signDataByWeb3 } from '@/utils/wallet'
import MetamaskButtonView from './metamask'

interface MetaMaskStandaloneLoginButtonProps {
  className?: string
  onSuccess?: () => void
}

export default function MetaMaskStandaloneLoginButton({
  className,
  onSuccess,
}: MetaMaskStandaloneLoginButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { sdk: metamaskSDK } = useSDK()
  const [doWeb3Auth] = useAuthByWeb3LazyQuery()

  const handleMetaMaskLogin = async () => {
    if (!metamaskSDK) {
      toast.error('MetaMask SDK not initialized')
      return
    }

    setIsLoading(true)

    try {
      // Step 1: Connect wallet and sign message
      const connectToast = toast.loading('Connecting to MetaMask...')
      const walletData = await signDataByWeb3(metamaskSDK)
      toast.success('Connected to MetaMask', { id: connectToast })

      // Step 2: Authenticate with backend
      const authToast = toast.loading('Authenticating...')
      const authResponse = await doWeb3Auth({
        variables: {
          payload: {
            address: walletData.address,
            signature: walletData.signature,
            text: walletData.text,
          },
        },
      })

      const loginData = authResponse.data?.loginByWeb3

      if (!loginData) {
        throw new Error('Authentication failed')
      }

      // Step 3: Handle new user flow
      if (loginData.noAccountFrom3rdPart) {
        toast.dismiss(authToast)
        const { address, signature, text } = walletData
        router.push(
          `/auth/callback/metamask?a=${address}&s=${signature}&t=${encodeURIComponent(text)}`
        )
        return
      }

      // Step 4: Store authentication data
      const { user, token } = loginData

      await syncLoginStateToServer({ uid: user.id, token })

      localStorage.setItem(
        COOKIE_TOKEN_KEY,
        JSON.stringify({
          profile: user,
          token,
          createdAt: Date.now(),
        })
      )
      sessionStorage.setItem(COOKIE_TOKEN_KEY, token)
      sessionStorage.setItem(USER_ID_KEY, user.id.toString())

      profile.token = token
      profile.uid = user.id

      sentry.setUser({
        email: user.email,
        id: user.id.toString(),
        username: user.name,
      })

      updateToken(token)

      toast.success('Successfully logged in!', { id: authToast })

      // Step 5: Navigate to dashboard
      setTimeout(() => {
        const domain = user.domain.length > 2 ? user.domain : user.id
        router.push(`/dash/${domain}/home?from_auth=1`)
      }, 100)

      onSuccess?.()
    } catch (error) {
      console.error('MetaMask login error:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed'
      toast.error(`MetaMask login failed: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={className}>
      <MetamaskButtonView
        loading={isLoading}
        disabled={isLoading}
        onClick={handleMetaMaskLogin}
      />
    </div>
  )
}
