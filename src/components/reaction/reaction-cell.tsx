import { Button, Tooltip } from '@mantine/core'
import React, { useCallback } from 'react'
import { FetchClippingQuery, ReactionTarget, useReactionCreateMutation, useReactionRemoveMutation } from '../../schema/generated'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { useApolloClient } from '@apollo/client'
import Loading2Icon from '../icons/loading2.svg'

export type SymbolGroupedData = {
  count: number,
  done: boolean,
  creators: { id: number, avatar: string, name: string }[],
}

type ReactionCellProps = {
  cid: number
  myUid: number
  symbol: string
  data: SymbolGroupedData
}

function ReactionCell(props: ReactionCellProps) {
  const { symbol, cid, myUid, data } = props
  const { t } = useTranslation()

  const client = useApolloClient()
  const navigate = useRouter()

  const [doReactionCreate, { loading: isCreating }] = useReactionCreateMutation({
    onCompleted() {
      toast.success(t('app.clipping.reactions.addSuccess'))
      client.resetStore()
    },
    onError() {
      toast.error(t('app.clipping.reactions.actionRejected'))
    }
  })
  const [doReactionRemove, { loading: isRemoving }] = useReactionRemoveMutation({
    onCompleted() {
      toast.success(t('app.clipping.reactions.removeSuccess'))
      client.resetStore()
    },
    onError() {
      toast.error(t('app.clipping.reactions.actionRejected'))
    }
  })

  const onCellClick = useCallback(() => {
    if (myUid <= 0) {
      navigate.push('/auth/auth-v4')
      return
    }
    if (data.done) {
      return doReactionRemove({
        variables: {
          symbol
        }
      })
    }
    return doReactionCreate({
      variables: {
        target: ReactionTarget.Clipping,
        targetId: cid,
        symbol: symbol,
      }
    })
  }, [cid, data.done, doReactionCreate, doReactionRemove, myUid, navigate, symbol])

  return (
    <Tooltip
      className='inline-block w-min ml-1 first:ml-0'
      label={data.creators.map(x => x.name).join(', ')}
      disabled={data.creators.length === 0}
      withArrow
    >
      <Button
        loading={isCreating || isRemoving}
        size='lg'
        onClick={onCellClick}
      >
        <span className='text-2xl'>{symbol}</span>
        <span className='text-2xl ml-2'>{data.count}</span>
      </Button>
    </Tooltip>
  )
}

export default ReactionCell
