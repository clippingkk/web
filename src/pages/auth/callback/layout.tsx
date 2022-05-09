import Head from 'next/head'
import React, { useState } from 'react'
import BindPhone from '../../../components/bind-phone'
import LoadingIcon from '../../../components/icons/loading.svg'
import OGWithAuth from '../../../components/og/og-with-auth'

type AuthCallbackPageContainerProps = {
  doBind: () => Promise<any>
  onAuthCallback: (pn: string, code: string) => Promise<any>
  loading: boolean
  children?: React.ReactElement
}

function AuthCallbackPageContainer(props: AuthCallbackPageContainerProps) {
  const [willBind, setWillBind] = useState(false)
  return (
    <>
      <Head>
        <title>登陆</title>
        <OGWithAuth urlPath='auth/auth-v2' />
      </Head>
      <div className='anna-page-container flex h-screen items-center justify-center relative flex-col'>
        <div
         className={ 'duration-150 ' + (willBind ? 'opacity-50 ' : '')}
        >
          <h3 className='text-8xl dark:text-gray-100'> Cool, 已经登录成功 </h3>
          <h4 className='text-6xl mt-4 dark:text-gray-100'>您是否已有账户了？</h4>

          <div className='my-8 flex flex-col'>
            <button
              className='py-4 px-8 from-teal-400 via-teal-500 to-teal-400 bg-gradient-to-br rounded-lg text-8xl hover:shadow-lg hover:scale-105 duration-150'
              onClick={props.doBind}
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
        </div>
        {willBind && (
          <div className='with-fade-in w-full mx-auto'>
            <BindPhone
              onFinalCheck={props.onAuthCallback}
            />
          </div>
        )}

        {props.loading && (
          <div className='flex w-full h-full absolute inset-0 bg-black bg-opacity-50 justify-center items-center flex-col backdrop-blur-sm with-fade-in'>
            <LoadingIcon className='animate-spin' />
            <span className='dark:text-white text-sm mt-4'>Submitting...</span>
          </div>
        )}
      </div>
      {/* {props.children} */}
    </>
  )
}

export default AuthCallbackPageContainer
