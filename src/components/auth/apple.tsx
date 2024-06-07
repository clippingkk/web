import AppleSignin from 'react-apple-signin-auth'
import WithLoading from '../with-loading'
import { AppleAuthResponse } from '../../services/apple'
import { useMemo } from 'react'

type AppleLoginButtonViewProps = {
  loading: boolean
  disabled?: boolean
  onSuccess: (resp: AppleAuthResponse) => void
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

function AuthAppleButton(props: any) {
  return (
    <button
      className='flex justify-center items-center bg-black text-white w-full mt-4 rounded hover:scale-105 duration-150 py-0.5'
      onClick={props.onClick}
    >
      {props.children}
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
    <WithLoading
      loading={loading}
      disabled={disabled}
    >
      <AppleSignin
        authOptions={appleAuthOptions}
        uiType="dark"
        className="apple-auth-btn"
        noDefaultStyle={false}
        buttonExtraChildren="Continue with Apple"
        onSuccess={onSuccess}
        onError={onError}
        skipScript={false}
        // iconProp={{ style: { marginTop: '10px' } }}
        render={AuthAppleButton}
      />
    </WithLoading>
  )
}

export default AppleLoginButtonView
