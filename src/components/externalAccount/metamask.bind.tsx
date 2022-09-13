import { useApolloClient, useMutation } from '@apollo/client'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect } from 'react'
import { toast } from 'react-toastify'
import { hooks, metaMask, signDataByWeb3 } from '../../utils/wallet'
import bindWeb3Mutation from '../../schema/bindWeb3.graphql'
import { bindWeb3Address, bindWeb3AddressVariables } from '../../schema/__generated__/bindWeb3Address'
import WithLoading from '../with-loading'
import { useTranslation } from 'react-i18next'

type MetamaskBindButtonProps = {
}

function MetamaskBindButton(props: MetamaskBindButtonProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [doBind, doBindResult] = useMutation<bindWeb3Address, bindWeb3AddressVariables>(bindWeb3Mutation)
  const isActivating = hooks.useIsActivating()
  const isActive = hooks.useIsActive()
  const account = hooks.useAccount()
  const client = useApolloClient()
  const onMetamaskLogin = useCallback(async () => {
    const resp = await metaMask.activate()
    // if (metaMask.deactivate) {
    //   await metaMask.deactivate()
    // }
    // const resp = await metaMask.connectEagerly()
  }, [])

  useEffect(() => {
    void metaMask.connectEagerly().catch((err) => {
      console.debug('Failed to connect eagerly to metamask')
      toast.error('metamask: ' + err.message)
    })

  }, [])

  useEffect(() => {
    if (!account) {
      return
    }

    signDataByWeb3(account)
      .then(res => {
        return doBind({
          variables: {
            payload: {
              address: res.address,
              signature: res.signature,
              text: res.text
            }
          }
        }).then(r => {
          toast.success(t('app.common.bound'))
          client.resetStore()
        })
      }).catch((err: any) => {
        toast.error(err.message)
      })
  }, [account, client, doBind, router, t])
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
