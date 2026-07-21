'use client'
import { useMemo } from 'react'

import ReactionCell, {
  type SymbolGroupedData,
} from '@/components/reaction/reaction-cell'
import type { FetchClippingQuery } from '@/gql/graphql'

const availableReactions = ['👍', '❤️', '⭐️', '🐶', '😱']

type ReactionsProps = {
  cid: number
  reactions?: FetchClippingQuery['clipping']['reactionData']
  uid?: number
}

function Reactions(props: ReactionsProps) {
  const { uid, reactions, cid } = props

  const symbolCounts = useMemo(() => {
    const symbolData: Record<string, SymbolGroupedData> = {}
    if (!reactions?.symbolCounts) {
      return symbolData
    }
    // 如果服务端返回的没有这些数据，则补全
    for (const ar of availableReactions) {
      if (!(ar in symbolData)) {
        symbolData[ar] = {
          count: 0,
          done: false,
          reactionId: undefined,
          creators: [],
        }
      }

      const group = reactions.symbolCounts.find((x) => x.symbol === ar)
      if (!group) continue
      symbolData[ar].creators = group.recently.map((item) => item.creator)
      symbolData[ar].count = group.count
      symbolData[ar].done = group.done
      symbolData[ar].reactionId = group.recently.find(
        (item) => item.creator.id === uid
      )?.id
    }
    return symbolData
  }, [reactions?.symbolCounts, uid])

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-3">
        {Object.keys(symbolCounts).map((k) => (
          <ReactionCell
            key={k}
            cid={cid}
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
