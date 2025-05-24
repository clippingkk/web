import Tooltip from '@annatarhe/lake-ui/tooltip'
import { useApolloClient } from '@apollo/client'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import {
  ReactionTarget,
  useReactionCreateMutation,
  useReactionRemoveMutation,
} from '../../schema/generated'
import Loading2Icon from '../icons/loading2.svg'

export type SymbolGroupedData = {
  count: number
  done: boolean
  creators: { id: number; avatar: string; name: string }[]
}

type ReactionCellProps = {
  cid: number
  myUid?: number
  symbol: string
  data: SymbolGroupedData
}

function ReactionCell(props: ReactionCellProps) {
  const { symbol, cid, myUid, data } = props
  const { t } = useTranslation()

  const client = useApolloClient()
  const navigate = useRouter()

  const [doReactionCreate, { loading: isCreating }] = useReactionCreateMutation(
    {
      onCompleted() {
        toast.success(t('app.clipping.reactions.addSuccess'))
        navigate.refresh()
        client.resetStore()
      },
      onError() {
        toast.error(t('app.clipping.reactions.actionRejected'))
      },
    }
  )
  const [doReactionRemove, { loading: isRemoving }] = useReactionRemoveMutation(
    {
      onCompleted() {
        toast.success(t('app.clipping.reactions.removeSuccess'))
        navigate.refresh()
        client.resetStore()
      },
      onError() {
        toast.error(t('app.clipping.reactions.actionRejected'))
      },
    }
  )

  const onCellClick = useCallback(() => {
    if (!myUid || myUid <= 0) {
      navigate.push('/auth/auth-v4')
      return
    }
    if (data.done) {
      return doReactionRemove({
        variables: {
          symbol,
        },
      })
    }
    return doReactionCreate({
      variables: {
        target: ReactionTarget.Clipping,
        targetId: cid,
        symbol: symbol,
      },
    })
  }, [
    cid,
    data.done,
    doReactionCreate,
    doReactionRemove,
    myUid,
    navigate,
    symbol,
  ])

  return (
    <Tooltip
      className="inline-block"
      content={data.creators.map((x) => x.name).join(', ')}
      disabled={data.creators.length === 0}
    >
      <button
        onClick={onCellClick}
        disabled={isCreating || isRemoving}
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 transition-all duration-200 ease-in-out ${
          data.done
            ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-800/50'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:bg-gray-700/50'
        } text-sm hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <span className="text-base leading-none">{symbol}</span>
        <span
          className={`min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-xs leading-none ${
            data.done
              ? 'bg-indigo-200/70 dark:bg-indigo-800/70'
              : 'bg-gray-200/70 dark:bg-gray-700/70'
          } `}
        >
          {data.count}
        </span>
        {(isCreating || isRemoving) && (
          <Loading2Icon className="mr-0.5 -ml-0.5 h-3 w-3" />
        )}
      </button>
    </Tooltip>
  )
}

export default ReactionCell
