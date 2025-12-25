'use client'

/* METAMASK DISABLED - Package removed to prevent hydration errors
import { useApolloClient } from '@apollo/client'
import { useSDK } from '@metamask/sdk-react'
import { useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { useTranslation } from '@/i18n/client'
import { useBindWeb3AddressMutation } from '@/schema/generated'
import { signDataByWeb3 } from '@/utils/wallet'
import WithLoading from '../with-loading'

type MetamaskBindButtonProps = {
  onBound?: (address: string) => void
}

function MetamaskBindButton(props: MetamaskBindButtonProps) {
  const { t } = useTranslation()
  const [doBind, doBindResult] = useBindWeb3AddressMutation()
  const client = useApolloClient()
  const { sdk: metamaskSDK } = useSDK()
  const onMetamaskLogin = useCallback(() => {
    if (!metamaskSDK) {
      return
    }
    let account = ''
    return (
      signDataByWeb3(metamaskSDK)
        .then((res) => {
          account = res.address!
          return doBind({
            variables: {
              payload: {
                address: res.address!,
                signature: res.signature!,
                text: res.text,
              },
            },
          }).then(() => {
            toast.success(t('app.common.bound'))
            client.resetStore()
            if (props.onBound) {
              props.onBound(account)
            }
          })
        })

        .catch((err: any) => {
          toast.error(err.message)
        })
    )
  }, [client.resetStore, doBind, metamaskSDK, props.onBound, t])

  return (
    <WithLoading loading={doBindResult.loading}>
      <button
        className='flex w-full items-center justify-center rounded-sm bg-purple-400 px-4 py-2 duration-150 hover:scale-105 hover:shadow-lg disabled:bg-gray-400 disabled:hover:scale-100 disabled:hover:shadow-none'
        onClick={onMetamaskLogin}
      >
        {t('app.common.bind')}
      </button>
    </WithLoading>
  )
}

export default MetamaskBindButton
*/

type MetamaskBindButtonProps = {
  onBound?: (address: string) => void
}

// Disabled MetaMask bind button - returns null
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function MetamaskBindButton(props: MetamaskBindButtonProps) {
  return null
}

export default MetamaskBindButton
