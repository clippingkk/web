import { useApolloClient, useMutation } from '@apollo/client'
import React, { useCallback, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { signDataByWeb3 } from '../../utils/wallet'
import WithLoading from '../with-loading'
import { useTranslation } from 'react-i18next'
import { useBindWeb3AddressMutation } from '../../schema/generated'

type MetamaskBindButtonProps = {
  onBound?: (address: string) => void
}

function MetamaskBindButton(props: MetamaskBindButtonProps) {
  const { t } = useTranslation()
  const [doBind, doBindResult] = useBindWeb3AddressMutation()
  const client = useApolloClient()
  const onMetamaskLogin = useCallback(async () => {
    let account = ''
    return signDataByWeb3()
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
        }).then(r => {
          toast.success(t('app.common.bound'))
          client.resetStore()
          if (props.onBound) {
            props.onBound(account)
          }
        })
      }).catch((err: any) => {
        toast.error(err.message)
      })
  }, [])

  return (
    <WithLoading
      loading={doBindResult.loading}
    >
      <button
        className='px-4 py-2 rounded hover:shadow-lg bg-purple-400 flex justify-center items-center hover:scale-105 duration-150 disabled:bg-gray-400 disabled:hover:scale-100 disabled:hover:shadow-none w-full'
        onClick={onMetamaskLogin}
      >
        {t('app.common.bind')}
      </button>
    </WithLoading>
  )
}

export default MetamaskBindButton
