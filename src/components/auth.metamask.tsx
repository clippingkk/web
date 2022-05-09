import { useLazyQuery } from '@apollo/client'
import React, { useCallback, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useAuthBy3rdPartSuccessed } from '../hooks/hooks'
import { authByWeb3, authByWeb3Variables } from '../schema/__generated__/authByWeb3'
import { metaMask, hooks, signDataByWeb3 } from '../utils/wallet'
import authByWeb3Query from '../schema/authByWeb3.graphql'
import MetamaskLogo from './icons/metamask.logo.svg'
import { useRouter } from 'next/router'
import LoadingIcon from './icons/loading.svg'

type AuthByMetamaskProps = {
}

function AuthByMetamask(props: AuthByMetamaskProps) {
  const router = useRouter()
  const [doAuth, doAuthData] = useLazyQuery<authByWeb3, authByWeb3Variables>(authByWeb3Query)
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

    signDataByWeb3(account)
      .then(res => {
        return doAuth({
          variables: {
            payload: {
              address: res.address,
              signature: res.signature,
              text: res.text
            }
          }
        }).then(r => {
          if (r.data?.loginByWeb3.noAccountFrom3rdPart) {
            router.push(`/auth/callback/metamask?a=${res.address}&s=${res.signature}&t=${encodeURIComponent(res.text)}`)
            return
          }
        })
      }).catch((err: any) => {
        toast.error(err.message)
      })
  }, [account, doAuth, router])

  useAuthBy3rdPartSuccessed(doAuthData.called, doAuthData.loading, doAuthData.error, doAuthData.data?.loginByWeb3)

  const disabled = doAuthData.loading

  return (
    <button
      className=' relative px-16 py-4 rounded hover:shadow-lg bg-purple-400 flex justify-center items-center hover:scale-105 duration-150 disabled:bg-gray-400 disabled:hover:scale-100 disabled:hover:shadow-none'
      onClick={onMetamaskLogin}
      disabled={disabled}
    >
      <MetamaskLogo size={24} />
      <span className='text-2xl ml-4'>Metamask</span>
      {disabled && (
        <div className='flex w-full h-full absolute inset-0 bg-black bg-opacity-50 justify-center items-center backdrop-blur-sm with-fade-in'>
          <LoadingIcon className='animate-spin' />
          <span className='dark:text-white text-sm ml-4'>Submitting...</span>
        </div>
        )}
    </button>
  )
}

export default AuthByMetamask
