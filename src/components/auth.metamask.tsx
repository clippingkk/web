import { useLazyQuery } from '@apollo/client'
import React, { useCallback, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import WalletConnectProvider from "@walletconnect/web3-provider"
import { useAuthBy3rdPartSuccessed } from '../hooks/hooks'
import { authByWeb3, authByWeb3Variables } from '../schema/__generated__/authByWeb3'
import { metaMask, hooks, signDataByWeb3 } from '../utils/wallet'
import authByWeb3Query from '../schema/authByWeb3.graphql'
import MetamaskLogo from './icons/metamask.logo.svg'
import { useRouter } from 'next/router'
import LoadingIcon from './icons/loading.svg'
import WithLoading from './with-loading'
import WalletConnect from '@walletconnect/client'
import QRCodeModal from '@walletconnect/qrcode-modal'
import { isMobile } from '../utils/device'

type AuthByMetamaskProps = {
}

function useWalletConnect() {
  const wc = useRef<WalletConnectProvider | null>()

  useEffect(() => {
    // const connector = new WalletConnect({
    //   bridge: "https://bridge.walletconnect.org", // Required
    //   qrcodeModal: QRCodeModal,
    // })

    //  Create WalletConnect Provider
    const connector = new WalletConnectProvider({
      infuraId: "27e484dcd9e3efcfd25a83a78777cdf1",
      qrcodeModalOptions: {
        mobileLinks: [
          "rainbow",
          "metamask",
          "argent",
          "trust",
          "imtoken",
          "pillar",
        ],
      },
    });

    //  Enable session (triggers QR Code modal)
    wc.current = connector
    // connector.on("connect", (error, payload) => {
    //   if (error) {
    //     throw error;
    //   }

    //   // Get provided accounts and chainId
    //   const { accounts, chainId } = payload.params[0]
    //   console.log('on connected', accounts, chainId)
    // });

    // connector.on("session_update", (error, payload) => {
    //   if (error) {
    //     throw error;
    //   }

    //   // Get updated accounts and chainId
    //   const { accounts, chainId } = payload.params[0];
    // });

    // connector.on("disconnect", (error, payload) => {
    //   if (error) {
    //     throw error;
    //   }
    //   // Delete connector
    // })
  }, [])

  const onWeb3Login = useCallback(async () => {
    const connector = wc.current
    if (!connector) {
      return
    }
    const addrs = await connector.enable();
    console.log('on login response', addrs)
    // if (!connector.connected) {
    //   connector.createSession()
    // }
  }, [])

  return {
    wc,
    onWeb3Login
  }
}

function AuthByMetamask(props: AuthByMetamaskProps) {
  const router = useRouter()
  // const { wc, onWeb3Login } = useWalletConnect()
  const [doAuth, doAuthData] = useLazyQuery<authByWeb3, authByWeb3Variables>(authByWeb3Query)
  const isActivating = hooks.useIsActivating()
  const isActive = hooks.useIsActive()
  const account = hooks.useAccount()
  const err = hooks.useError()
  const onMetamaskLogin = useCallback(async () => {

    // if (isMobile()) {
    //   onWeb3Login()
    // } else {
      const resp = await metaMask.activate()
      await metaMask.deactivate()
    // }
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
    <WithLoading
      loading={disabled}
    >
      <button
        className='px-16 py-4 rounded hover:shadow-lg bg-purple-400 flex justify-center items-center hover:scale-105 duration-150 disabled:bg-gray-400 disabled:hover:scale-100 disabled:hover:shadow-none w-full'
        onClick={onMetamaskLogin}
        disabled={disabled}
      >
        <MetamaskLogo size={24} />
        <span className='text-2xl ml-4'>Metamask</span>
      </button>
    </WithLoading>
  )
}

export default AuthByMetamask
