'use client'
import { useSDK } from '@metamask/sdk-react'
// import MetamaskLogo from './icons/metamask.logo.svg'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { useAuthBy3rdPartSuccessed } from '../hooks/hooks'
import { useAuthByWeb3LazyQuery } from '../schema/generated'
import { signDataByWeb3 } from '../utils/wallet'
import MetamaskButtonView from './auth/metamask'

function AuthByMetamask() {
  const router = useRouter()
  const [doAuth, doAuthData] = useAuthByWeb3LazyQuery()
  const { sdk: metamaskSDK } = useSDK()
  // const err = hooks.useError()
  const onMetamaskLogin = useCallback(async () => {
    if (!metamaskSDK) {
      return
    }
    try {
      const res = await signDataByWeb3(metamaskSDK)
      const r = await doAuth({
        variables: {
          payload: {
            address: res.address!,
            signature: res.signature!,
            text: res.text,
          },
        },
      })
      if (r.data?.loginByWeb3.noAccountFrom3rdPart) {
        router.push(
          `/auth/callback/metamask?a=${res.address}&s=${res.signature}&t=${encodeURIComponent(res.text)}`
        )
        return
      }
       
    } catch (err: any) {
      toast.error(err.message)
    }
  }, [doAuth, router, metamaskSDK])

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

  useAuthBy3rdPartSuccessed(
    doAuthData.called,
    doAuthData.loading,
    doAuthData.error,
    doAuthData.data?.loginByWeb3
  )

  const disabled = doAuthData.loading

  return (
    <MetamaskButtonView
      loading={doAuthData.loading}
      onClick={onMetamaskLogin}
      disabled={disabled}
    />
  )
}

export default AuthByMetamask
