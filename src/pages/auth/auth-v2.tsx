import React, { useCallback, useEffect } from 'react'
import Image from 'next/image'
import { useBackgroundImage } from '../../hooks/theme'
import logo from '../../assets/logo.png'
import MetamaskLogo from '../../components/icons/metamask.logo.svg'
import Head from 'next/head'
import OGWithAuth from '../../components/og/og-with-auth'
import { metaMask, hooks, signDataByWeb3 } from '../../utils/wallet'
import { toast } from 'react-toastify'
import { useMutation } from '@apollo/client'
import authByWeb3Query from '../../schema/authByWeb3.graphql'
import { authByWeb3, authByWeb3Variables } from '../../schema/__generated__/authByWeb3'
import { useAuthByWeb3Successed } from '../../hooks/hooks'

type AuthV2Props = {
}

function AuthV2(props: AuthV2Props) {
  const bg = useBackgroundImage()

  const [doAuth, doAuthData] = useMutation<authByWeb3, authByWeb3Variables>(authByWeb3Query)

  const isActivating = hooks.useIsActivating()
  const isActive = hooks.useIsActive()
  const account = hooks.useAccount()
  const err = hooks.useError()

  const onMetamaskLogin = useCallback(async () => {
    const resp = await metaMask.activate()
    console.log('on metamask login end', resp)
    await metaMask.deactivate()
    // const resp = await metaMask.connectEagerly()
  }, [])

  useEffect(() => {
    if (!err) {
      return
    }
    toast.error('metamask: ' + err.message)
  }, [err])

  useEffect(() => {
    if (!account) {
      return
    }

    signDataByWeb3(account).then(res => {
      doAuth({
        variables: {
          payload: {
            address: res.address,
            signature: res.signature,
            text: res.text
          }
        }
      })
    })
  }, [account, doAuth])

  useAuthByWeb3Successed(doAuthData.called, doAuthData.loading, doAuthData.error, doAuthData.data?.loginByWeb3)

  return (
    <React.Fragment>
      <Head>
        <title>Login by web3</title>
        <OGWithAuth urlPath='auth/auth-v2' />
      </Head>
      <section
        className='anna-page-container h-screen object-cover bg-center bg-cover'
        style={{
          backgroundImage: `url(${bg})`
        }}
      >
        <div
          className='flex w-full h-full backdrop-blur-xl bg-black bg-opacity-30 justify-center items-center'
        >
          <div className='p-12 rounded backdrop-blur-xl shadow bg-opacity-10 bg-blue-400'>
            <div className='flex justify-center items-center flex-col mb-4'>
              <Image
                src={logo}
                alt="clippingkk logo"
                // className='w-24 h-24 lg:w-48 lg:h-48 shadow rounded'
                width={96}
                height={96}
              />
              <h1 className='text-center font-bold text-3xl dark:text-gray-100 mt-4'>ClippingKK</h1>
            </div>

            <div>
              <h2 className='text-2xl dark:text-gray-100 mb-4'>Login by ...</h2>
              <button
                className=' px-16 py-2 rounded-lg hover:shadow-lg bg-purple-400 hover:bg-purple-500 flex justify-center items-center duration-150'
                onClick={onMetamaskLogin}
              >
                <MetamaskLogo />
                <span className='text-2xl ml-4'>Metamask</span>
              </button>

            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  )
}

export default AuthV2
