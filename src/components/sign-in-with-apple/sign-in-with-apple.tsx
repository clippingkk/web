import { useCallback, useEffect } from 'react'
import { SignInWithAppleOptions } from '../../constants/config'

const scriptURL =
  'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js'

const scriptDomId = 'sign-in-with-app-script'
function SignInWithApple() {
  useEffect(() => {
    const has = document.querySelector(`#${scriptDomId}`)
    if (has) {
      return
    }
    const dom = document.createElement('script')
    dom.src = scriptURL
    document.body.appendChild(dom)

    function onScriptLoad() {
      if (!window.AppleID) {
        return
      }
      window.AppleID.auth.init(SignInWithAppleOptions)
    }
     
    function onAppleSignInSuccess(data: any) {
      console.log(data)
    }
     
    function onAppleSignInFail(err: any) {
      console.log(err)
    }

    dom.addEventListener('load', onScriptLoad)

    //Listen for authorization success
    document.addEventListener('AppleIDSignInOnSuccess', onAppleSignInSuccess)
    //Listen for authorization failures
    document.addEventListener('AppleIDSignInOnFailure', onAppleSignInFail)

    return () => {
      document.removeEventListener(
        'AppleIDSignInOnSuccess',
        onAppleSignInSuccess
      )
      document.removeEventListener('AppleIDSignInOnFailure', onAppleSignInFail)
      document.removeChild(dom)
    }
  }, [])

  const onSignin = useCallback(async () => {
    const response = await window.AppleID?.auth.signIn()
    return response
  }, [])

  return (
    <div>
      <button onClick={onSignin}>onsignin</button>
    </div>
  )
}

export default SignInWithApple
