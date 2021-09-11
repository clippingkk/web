import React, { useCallback, useMemo, useState } from 'react'
import { Picker } from 'emoji-mart'
import { fetchClipping_clipping_reactions } from '../../../../schema/__generated__/fetchClipping'
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
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import Link from 'next/link'

type ReactionsProps = {
  cid: number
  reactions: readonly fetchClipping_clipping_reactions[]
}

type groupedReactions = {
  [x: string]: fetchClipping_clipping_reactions[]
}

function Reactions(props: ReactionsProps) {
  const rs = useMemo(() => {
    return props.reactions.reduce<groupedReactions>((acc, c) => {
      const result: fetchClipping_clipping_reactions[] = []
      if (c.symbol in acc) {
        result.concat([...(acc[c.symbol]), c])
      } else {
        result.push(c)
      }
      acc[c.symbol] = result
      return acc
    }, {})
  }, [props.reactions.map(x => x.id).join('')])
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
  return (
    <div className='w-full'>
      <div className='relative inline-block w-full'>
        {Object.keys(rs).map(k => (
          <Tooltip
            className='inline-block w-min'
            key={k}
            placement='top'
            overlay={(
              <div>
                {rs[k].map(x => (
                  <span key={x.id}>
                    {x.creator.name}
                  </span>
                ))}
              </div>
            )}
          >
            <button
              className='inline-flex py-4 px-8 rounded-3xl hover:bg-gray-300 hover:bg-opacity-70 duration-300 transition-colors items-center justify-center'
              onClick={() => {
                if (uid === 0) {
                  navigate('/auth/signin')
                  return
                }
                const val = rs[k].find(x => x.creator.id === uid)
                if (val) {
                  doReactionRemove({
                    variables: {
                      rid: val.id
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
                    symbol: k,
                  }
                }).then(() => {
                  toast.success(t('app.clipping.reactions.addSuccess'))
                  client.resetStore()
                }).catch(err => {
                  toast.error(t('app.clipping.reactions.actionRejected'))
                })
              }}
            >
              <span className='text-2xl'>{k}</span>
              <span className='text-2xl ml-2'>{rs[k].length}</span>
            </button>
          </Tooltip>
        ))}
        {uid === 0 ? (
          <Link
            href='/auth/signin'
          >
            <a
              className='py-4 px-8 rounded-3xl hover:bg-gray-300'
            >
              ➕
            </a>
          </Link>
        ) : (
          <button
            className='py-4 px-8 rounded-3xl hover:bg-gray-300'
            onClick={togglePicker}
          >➕</button>
        )}
        {pickerVisible && (
          <Dialog
            title='aaa'
            onCancel={togglePicker}
            onOk={togglePicker}
          >
            <Picker
              native
              onSelect={emoji => {
                doReactionCreate({
                  variables: {
                    target: ReactionTarget.clipping,
                    targetId: props.cid,
                    symbol: (emoji as any).native,
                  }
                }).then(() => {
                  toast.success(t('app.clipping.reactions.addSuccess'))
                  client.resetStore()
                }).catch(err => {
                  toast.error(t('app.clipping.reactions.actionRejected'))
                })
                togglePicker()
              }}
            />
          </Dialog>
        )}
      </div>
    </div>
  )
}

export default Reactions
