'use client';
import React, { useCallback, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { useAuthBy3rdPartSuccessed } from '../hooks/hooks'
import { metaMask, hooks, signDataByWeb3 } from '../utils/wallet'
import MetamaskLogo from './icons/metamask.logo.svg'
import { useRouter } from 'next/navigation'
import LoadingIcon from './icons/loading.svg'
import WithLoading from './with-loading'
import { isMobile } from '../utils/device'
import { useAuthByWeb3LazyQuery } from '../schema/generated'
import { Button } from '@mantine/core';

type AuthByMetamaskProps = {
}

function AuthByMetamask(props: AuthByMetamaskProps) {
  const router = useRouter()
  const [doAuth, doAuthData] = useAuthByWeb3LazyQuery()
  const isActivating = hooks.useIsActivating()
  const isActive = hooks.useIsActive()
  const account = hooks.useAccount()
  // const err = hooks.useError()
  const onMetamaskLogin = useCallback(async () => {
    try {
      if (metaMask.deactivate) {
        await metaMask.deactivate()
      }
      const resp = await metaMask.activate()
    } catch (e: any) {
      //  e === { code: number, message: string}
      toast.error(`metamask: ${e.code} ${e.message}`)
    }

  }, [])

  // useEffect(() => {
  //   // if (!err) {
  //   //   return
  //   // }
  //   // toast.error('metamask: ' + err.message)
  //   void metaMask.connectEagerly().catch((err) => {
  //     console.debug('Failed to connect eagerly to metamask')
  //     toast.error('metamask: ' + err.message)
  //   })
  // }, [])

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
    <WithLoading
      loading={disabled}
    >
      <Button
        loading={doAuthData.loading}
        className='h-[47px] rounded hover:shadow-lg bg-purple-400 flex justify-center items-center hover:scale-105 hover:bg-purple-500 duration-150 w-full'
        onClick={onMetamaskLogin}
        disabled={disabled}
      >
        <MetamaskLogo size={24} />
        <span className='text-lg ml-4'>Metamask</span>
      </Button>
    </WithLoading>
  )
}

export default AuthByMetamask
