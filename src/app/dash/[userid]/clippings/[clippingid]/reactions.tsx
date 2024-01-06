import React, { useCallback, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { TGlobalStore } from '@/store'
import { FetchClippingQuery } from '@/schema/generated'
import ReactionCell, { SymbolGroupedData } from '@/components/reaction/reaction-cell'

const availableReactions = ["👍", "❤️", "⭐️", "🐶", "😱"]

type ReactionsProps = {
  cid: number
  reactions?: FetchClippingQuery['clipping']['reactionData']
}

function Reactions(props: ReactionsProps) {
  const [pickerVisible, setPickerVisible] = useState(false)
  const uid = useSelector<TGlobalStore, number>(s => s.user.profile.id)
  const togglePicker = useCallback(() => {
    setPickerVisible(s => !s)
  }, [])

  const symbolCounts = useMemo(() => {
    const symbolData: Record<string, SymbolGroupedData> = {}
    if (!props.reactions?.symbolCounts) {
      return symbolData
    }
    // 如果服务端返回的没有这些数据，则补全
    for (let ar of availableReactions) {
      if (!(ar in symbolData)) {
        symbolData[ar] = {
          count: 0,
          done: false,
          creators: [],
        }
      }

      symbolData[ar].creators = props.reactions.symbolCounts.filter(x => x.symbol === ar).map(x => x.recently.map(x => x.creator)).flat()
      symbolData[ar].count = symbolData[ar].creators.length
      symbolData[ar].done = symbolData[ar].creators.findIndex(x => x.id === uid) >= 0
    }
    return symbolData
  }, [props.reactions?.symbolCounts, uid])

  return (
    <div className='w-full'>
      <div className='relative inline-block w-full'>
        {Object.keys(symbolCounts).map(k => (
          <ReactionCell
            key={k}
            cid={props.cid}
            myUid={uid}
            data={symbolCounts[k]}
            symbol={k}
          />
        ))}
      </div>
    </div>
  )
}

export default Reactions
