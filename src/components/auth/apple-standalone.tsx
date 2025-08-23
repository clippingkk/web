'use client'
import * as sentry from '@sentry/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { syncLoginStateToServer } from '@/actions/login'
import { COOKIE_TOKEN_KEY, USER_ID_KEY } from '@/constants/storage'
import {
  AppleAuthVersion,
  AppleLoginPlatforms,
  useLoginByAppleLazyQuery,
} from '@/schema/generated'
import { updateToken } from '@/services/ajax'
import type { AppleAuthResponse } from '@/services/apple'
import profile from '@/utils/profile'
import AppleLoginButtonView from './apple'

interface AppleStandaloneLoginButtonProps {
  className?: string
  onSuccess?: () => void
}

export default function AppleStandaloneLoginButton({
  className,
  onSuccess,
}: AppleStandaloneLoginButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [doAppleAuth] = useLoginByAppleLazyQuery()

  const handleAppleSuccess = async (response: AppleAuthResponse) => {
    const { code, id_token, state } = response.authorization

    setIsAuthenticating(true)
    const authToast = toast.loading('Authenticating with Apple...')

    try {
      // Step 1: Authenticate with backend
      const authResponse = await doAppleAuth({
        variables: {
          payload: {
            code,
            idToken: id_token,
            state,
            version: AppleAuthVersion.V4,
            platform: AppleLoginPlatforms.Web,
          },
        },
      })

      const loginData = authResponse.data?.loginByApple

      if (!loginData) {
        throw new Error('Authentication failed')
      }

      // Step 2: Handle new user flow
      if (loginData.noAccountFrom3rdPart) {
        toast.dismiss(authToast)
        router.push(`/auth/callback/apple?i=${id_token}`)
        return
      }

      // Step 3: Store authentication data
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

      toast.success('Successfully logged in with Apple!', { id: authToast })

      // Step 4: Navigate to dashboard
      setTimeout(() => {
        const domain = user.domain.length > 2 ? user.domain : user.id
        router.push(`/dash/${domain}/home?from_auth=1`)
      }, 100)

      onSuccess?.()
    } catch (error) {
      console.error('Apple login error:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed'
      toast.error(`Apple login failed: ${errorMessage}`, { id: authToast })
    } finally {
      setIsAuthenticating(false)
      setIsLoading(false)
    }
  }

  const handleAppleError = (error: any) => {
    console.error('Apple Sign-In error:', error)
    toast.error(`Apple Sign-In failed: ${error?.error || 'Unknown error'}`)
    setIsLoading(false)
  }

  const handleAppleClick = () => {
    setIsLoading(true)
  }

  return (
    <div className={className} onClickCapture={handleAppleClick}>
      <AppleLoginButtonView
        version='v4'
        loading={isLoading || isAuthenticating}
        disabled={isLoading || isAuthenticating}
        onSuccess={handleAppleSuccess}
        onError={handleAppleError}
      />
    </div>
  )
}
