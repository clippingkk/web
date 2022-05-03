import React, { useCallback, useEffect } from 'react'
import { useScript, appleAuthHelpers } from 'react-apple-signin-auth'
import { toast } from 'react-toastify'

type AuthAppleProps = {
}

const authOptions = {
  clientId: 'com.annatarhe.clippingkk',
  scope: 'email name',
  redirectURI: 'https://98a9-101-87-176-213.ap.ngrok.io/api/v2/auth/apple',
  state: 'state',
  usePopup: true,
}


function AuthAppleButton(props: any) {
  // useEffect(() => {
  //   appleAuthHelpers.signIn({
  //     authOptions,
  //     onSuccess: (response: any) => console.log(response),
  //     onError: (error: any) => console.error(error),
  //   })
  // }, [])
  useScript(appleAuthHelpers.APPLE_SCRIPT_SRC)

  const doLogin = useCallback(async () => {
    try {
      const response = await appleAuthHelpers.signIn({
        authOptions,
        onError: (error: any) => console.error(error),
      });
      if (response) {
        console.log(response);
      } else {
        console.error('Error performing apple signin.');
      }
    } catch (e) {
      console.error(e)
    }
  }, [])


  return (
    <button
      className='flex justify-center items-center bg-black text-white w-full mt-4 rounded hover:scale-105 duration-150'
      onClick={doLogin}
    >
      login
      {/* {props.children} */}
    </button>
  )
}

// function AuthAppleButtonLegacy(props: AuthAppleProps) {
//   return (
//     <AppleSignin
//       /** Auth options passed to AppleID.auth.init() */
//       authOptions={{
//       }} // REQUIRED
//       /** General props */
//       uiType="dark"
//       /** className */
//       className="apple-auth-btn"
//       /** Removes default style tag */
//       noDefaultStyle={false}
//       /** Allows to change the button's children, eg: for changing the button text */
//       buttonExtraChildren="Continue with Apple"
//       /** Extra controlling props */
//       /** Called upon signin success in case authOptions.usePopup = true -- which means auth is handled client side */
//       onSuccess={(response: any) => console.log(response)} // default = undefined
//       /** Called upon signin error */
//       onError={
//         (error: any) => {
//           toast.error('Auth by Apple: ' + error.error)
//         }
//       } // default = undefined
//       /** Skips loading the apple script if true */
//       skipScript={false} // default = undefined
//       /** Apple image props */
//       iconProp={{ style: { marginTop: '10px' } }} // default = undefined
//     /** render function - called with all props - can be used to fully customize the UI by rendering your own component  */
//     // render={AuthByAppleButton}
//     // render={(props: any) => <button {...props}>My Custom Button</button>}
//     />
//   )
// }

export default AuthAppleButton
