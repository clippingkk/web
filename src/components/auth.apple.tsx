import { useLazyQuery, useMutation } from '@apollo/client'
import React, { useCallback, useEffect } from 'react'
import AppleSignin, { useScript, appleAuthHelpers } from 'react-apple-signin-auth'
import { toast } from 'react-toastify'
import { AppleAuthResponse } from '../services/apple'
import loginByAppleMutation from '../schema/auth/apple.graphql'
import { loginByApple, loginByAppleVariables } from '../schema/auth/__generated__/loginByApple'
import { useRouter } from 'next/router'
import { useAuthBy3rdPartSuccessed } from '../hooks/hooks'

type AuthAppleProps = {
}

const authOptions = {
  clientId: 'com.annatarhe.clippingkk',
  scope: 'email name',
  redirectURI: 'https://d291-101-87-176-213.ap.ngrok.io/auth/auth-v2',
  state: 'state',
  usePopup: true,
}

function AuthAppleButton(props: any) {
  return (
    <button
      className='flex justify-center items-center bg-black text-white w-full mt-4 rounded hover:scale-105 duration-150'
      onClick={props.onClick}
    >
      {props.children}
    </button>
  )
}

function AuthByAppleButton(props: AuthAppleProps) {
  const router = useRouter()
  const [doAppleAuth, appleAuthResponse] = useLazyQuery<loginByApple, loginByAppleVariables>(loginByAppleMutation)

  const onSuccess = useCallback(async (resp: AppleAuthResponse) => {
    const { code, id_token, state } = resp.authorization
    const r = await doAppleAuth({
      variables: {
        payload: {
          code: code,
          idToken: id_token,
          state: state,
          platform: 'web'
        }
      }
    })
    if (r.data?.loginByApple.noAccountFrom3rdPart) {
      router.push(`/auth/callback/apple?i=${id_token}`)
      return
    }
  }, [doAppleAuth, router])

  // on success
  useAuthBy3rdPartSuccessed(
    appleAuthResponse.called,
    appleAuthResponse.loading,
    appleAuthResponse.error,
    appleAuthResponse.data?.loginByApple
  )


  return (
    <AppleSignin
      authOptions={authOptions}
      uiType="dark"
      className="apple-auth-btn"
      noDefaultStyle={false}
      buttonExtraChildren="Continue with Apple"
      onSuccess={onSuccess}
      onError={
        (error: any) => {
          toast.error('Auth by Apple: ' + error.error)
        }
      }
      skipScript={false}
      iconProp={{ style: { marginTop: '10px' } }}
      render={AuthAppleButton}
    />
  )
}

// export default AuthAppleButton
export default AuthByAppleButton
