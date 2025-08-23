import { useMemo } from 'react'
import AppleSignin from 'react-apple-signin-auth'
import type { AppleAuthResponse } from '@/services/apple'
import WithLoading from '../with-loading'

type AppleLoginButtonViewProps = {
  loading: boolean
  disabled?: boolean
  onSuccess: (resp: AppleAuthResponse) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onError: (error: any) => void
  version?: 'v2' | 'v4'
}
const authOptions = {
  clientId: 'com.annatarhe.clippingkk',
  scope: 'email name',
  redirectURI: 'https://clippingkk.annatarhe.com/auth/auth-v2',
  state: 'state',
  usePopup: true,
}

type Props = {
  onClick: () => void
  children: React.ReactNode
}

function AuthAppleButton(props: Props) {
  const { onClick, children } = props
  return (
    <button
      className='relative w-full h-16 px-6 bg-white dark:bg-black border border-gray-200 dark:border-zinc-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group'
      onClick={onClick}
    >
      <div className='flex items-center justify-center gap-3 text-black dark:text-white'>
        {children}
      </div>
    </button>
  )
}

function AppleLoginButtonView(props: AppleLoginButtonViewProps) {
  const { loading, disabled, onSuccess, version = 'v2', onError } = props

  const appleAuthOptions = useMemo(() => {
    const v = { ...authOptions }
    if (version === 'v4') {
      v.redirectURI = 'https://clippingkk.annatarhe.com/auth/auth-v4'
    }
    return v
  }, [version])

  return (
    <WithLoading loading={loading} disabled={disabled}>
      <div className='apple-button-wrapper'>
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
        <AppleSignin
          authOptions={appleAuthOptions}
          uiType='light'
          className='apple-auth-btn'
          noDefaultStyle={false}
          buttonExtraChildren='Continue with Apple'
          onSuccess={onSuccess}
          onError={onError}
          skipScript={false}
          // iconProp={{ style: { marginTop: '10px' } }}
          render={AuthAppleButton}
        />
      </div>
    </WithLoading>
  )
}

export default AppleLoginButtonView
