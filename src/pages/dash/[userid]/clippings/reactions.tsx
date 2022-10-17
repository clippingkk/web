import React, { useCallback, useMemo, useState } from 'react'
import { Picker } from 'emoji-mart'
import reactionCreateMutation from '../../../../schema/reaction-create.graphql'
import reactionRemoveMutation from '../../../../schema/reaction-remove.graphql'
import { useApolloClient, useMutation } from '@apollo/client'
import { reactionCreate, reactionCreateVariables } from '../../../../schema/__generated__/reactionCreate'
import { reactionRemove, reactionRemoveVariables } from '../../../../schema/__generated__/reactionRemove'
import { ReactionTarget } from '../../../../../__generated__/globalTypes'
import { useSelector } from 'react-redux'
import { TGlobalStore } from '../../../../store'
import Dialog from '../../../../components/dialog/dialog'
import Tooltip from '../../../../components/tooltip/Tooltip'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { fetchClipping_clipping_reactionData, fetchClipping_clipping_reactionData_symbolCounts } from '../../../../schema/__generated__/fetchClipping'
import EmojiPicker from '../../../../components/emoji-picker'

const avaliableReactions = ["👍", "❤️", "⭐️", "🐶", "😱"]

type ReactionsProps = {
  cid: number
  reactions?: fetchClipping_clipping_reactionData
}

type ReactionCellProps = {
  symbol: string
  count: number
  onClick: () => void
}

function ReactionCell(props: ReactionCellProps) {
  const { push: navigate } = useRouter()
  return (
            <button
              className='inline-flex py-4 px-8 rounded-3xl hover:bg-gray-300 hover:bg-opacity-70 duration-300 transition-colors items-center justify-center'
              onClick={props.onClick}
            >
              <span className='text-2xl'>{props.symbol}</span>
              <span className='text-2xl ml-2'>{props.count}</span>
            </button>

  )
}

function Reactions(props: ReactionsProps) {
  const [pickerVisible, setPickerVisible] = useState(false)
  const client = useApolloClient()
  const [doReactionCreate] = useMutation<reactionCreate, reactionCreateVariables>(reactionCreateMutation)
  const [doReactionRemove] = useMutation<reactionRemove, reactionRemoveVariables>(reactionRemoveMutation)
  const uid = useSelector<TGlobalStore, number>(s => s.user.profile.id)
  const togglePicker = useCallback(() => {
    setPickerVisible(s => !s)
  }, [])
  const { t } = useTranslation()
  const { push: navigate } = useRouter()

  const symbolCounts = useMemo<fetchClipping_clipping_reactionData_symbolCounts[]>(() => {
    if (!props.reactions?.symbolCounts) {
    return []
    }
    const s = [...props.reactions.symbolCounts]

    // 如果服务端返回的没有这些数据，则补全
    for (let ar of avaliableReactions) {
      const has = s.findIndex(x => x.symbol === ar) > -1
      if (!has) {
        s.push({
          count: 0,
          symbol: ar,
          done: false,
          recently: [],
          __typename: 'ReactionWithSymbolCount',
        })
      }
    }
    return s
  }, [props.reactions?.symbolCounts])

  return (
    <div className='w-full'>
      <div className='relative inline-block w-full'>
        {symbolCounts.map(k => (
          <Tooltip
            className='inline-block w-min'
            key={k.symbol}
            placement='top'
            overlay={k.recently.length > 0 ? (
              <div>
                {k.recently.map(x => (
                  <span key={x.id}>
                    {x.creator.name}
                  </span>
                ))}
              </div>
            ) : (
              <div>waiting for your feedback</div>
            )}
          >
            <button
              className='inline-flex py-1 px-2 lg:py-4 lg:px-8 rounded-3xl hover:bg-gray-300 hover:bg-opacity-70 duration-300 transition-colors items-center justify-center'
              onClick={() => {
                if (uid <= 0) {
                  navigate('/auth/auth-v3')
                  return
                }
                if (k.done) {
                  doReactionRemove({
                    variables: {
                      symbol: k.symbol
                    }
                  }).then(() => {
                    toast.success(t('app.clipping.reactions.removeSuccess'))
                    client.resetStore()
                  }).catch(err => {
                    toast.error(t('app.clipping.reactions.actionRejected'))
                  })
                  return
                }
                doReactionCreate({
                  variables: {
                    target: ReactionTarget.clipping,
                    targetId: props.cid,
                    symbol: k.symbol,
                  }
                }).then(() => {
                  toast.success(t('app.clipping.reactions.addSuccess'))
                  client.resetStore()
                }).catch(err => {
                  toast.error(t('app.clipping.reactions.actionRejected'))
                })
              }}
            >
              <span className='text-2xl'>{k.symbol}</span>
              <span className='text-2xl ml-2 dark:text-white'>{k.count}</span>
            </button>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}

export default Reactions
