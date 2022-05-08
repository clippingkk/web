import { useMutation } from '@apollo/client'
import { useRouter } from 'next/router'
import React, { useCallback, useMemo, useState } from 'react'
import BindPhone from '../../../components/bind-phone'
import { useAuthBy3rdPartSuccessed } from '../../../hooks/hooks'
import bindAppleUniqueMutation from '../../../schema/auth/apple.bind.graphql'
import { bindAppleUnique, bindAppleUniqueVariables } from '../../../schema/auth/__generated__/bindAppleUnique'
import AuthPage from '../auth'

type AuthCallbackAppleProps = {
}

function AuthCallbackApple(props: AuthCallbackAppleProps) {
  const r = useRouter()
  console.log(r)
  const [willBind, setWillBind] = useState(false)

  const requestPayload = useMemo(() => {
    return {
      code: '',
      idToken: r.query.i as string,
      state: '',
      platform: 'web'
    }
  }, [r.query])

  const [doBind, doBindResult] = useMutation<bindAppleUnique, bindAppleUniqueVariables>(bindAppleUniqueMutation)

  const onAuthCallback = useCallback((pn: string, code: string) => {
    return doBind({
      variables: {
        phone: pn,
        code,
        payload: requestPayload
      }
    })
  }, [doBind, requestPayload])

  useAuthBy3rdPartSuccessed(
    doBindResult.called,
    doBindResult.loading,
    doBindResult.error,
    doBindResult.data?.bindAppleUnique
  )

  return (
    <div className='anna-page-container flex h-screen items-center justify-center'>
      <div>
        <h3 className=' text-8xl dark:text-gray-100'> Cool, 已经登录成功 </h3>
        <h4 className=' text-6xl mt-4 dark:text-gray-100'>您是否已有账户了？</h4>

        <div className='my-8 flex flex-col'>
          <button
           className='py-4 px-8 from-blue-400 via-teal-400 to-orange-400 bg-gradient-to-br rounded-lg text-8xl hover:shadow-lg hover:scale-105 duration-150'
           onClick={() => {
             doBind({
               variables: {
                 payload: requestPayload
               }
             })
           }}
          >
            之前没注册过，直接登陆
          </button>
          {!willBind && (
            <button
              className='py-4 px-8 from-blue-400 via-teal-400 to-orange-400 bg-gradient-to-br rounded-lg text-7xl hover:shadow-lg hover:scale-105 duration-150 mt-6'
              onClick={() => {
                setWillBind(true)
              }}
            >
              已有账户，需要绑定
            </button>
          )}
        </div>

        {willBind && (
          <div className='with-fade-in'>
            <BindPhone
              onFinalCheck={onAuthCallback}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default AuthCallbackApple
