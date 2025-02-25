import { useApolloClient } from '@apollo/client'
import React, { useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { signDataByWeb3 } from '@/utils/wallet'
import WithLoading from '../with-loading'
import { useTranslation } from 'react-i18next'
import { useBindWeb3AddressMutation } from '@/schema/generated'
import { useSDK } from '@metamask/sdk-react'

type MetamaskBindButtonProps = {
  onBound?: (address: string) => void
}

function MetamaskBindButton(props: MetamaskBindButtonProps) {
  const { t } = useTranslation()
  const [doBind, doBindResult] = useBindWeb3AddressMutation()
  const client = useApolloClient()
  const { sdk: metamaskSDK } = useSDK()
  const onMetamaskLogin = useCallback(async () => {
    if (!metamaskSDK) {
      return
    }
    let account = ''
    return signDataByWeb3(metamaskSDK)
      .then(res => {
        account = res.address!
        return doBind({
          variables: {
            payload: {
              address: res.address!,
              signature: res.signature!,
              text: res.text
            }
          }
        }).then(() => {
          toast.success(t('app.common.bound'))
          client.resetStore()
          if (props.onBound) {
            props.onBound(account)
          }
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }).catch((err: any) => {
        toast.error(err.message)
      })
  }, [])

  return (
    <WithLoading
      loading={doBindResult.loading}
    >
      <button
        className='px-4 py-2 rounded-sm hover:shadow-lg bg-purple-400 flex justify-center items-center hover:scale-105 duration-150 disabled:bg-gray-400 disabled:hover:scale-100 disabled:hover:shadow-none w-full'
        onClick={onMetamaskLogin}
      >
        {t('app.common.bind')}
      </button>
    </WithLoading>
  )
}

export default MetamaskBindButton
