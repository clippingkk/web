'use client'
import { useMemo } from 'react'
import ReactionCell, {
  type SymbolGroupedData,
} from '@/components/reaction/reaction-cell'
import type { FetchClippingQuery } from '@/schema/generated'

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
          creators: [],
        }
      }

      symbolData[ar].creators = reactions.symbolCounts
        .filter((x) => x.symbol === ar)
        .flatMap((x) => x.recently.map((x) => x.creator))
      symbolData[ar].count = symbolData[ar].creators.length
      symbolData[ar].done =
        symbolData[ar].creators.findIndex((x) => x.id === uid) >= 0
    }
    return symbolData
  }, [reactions?.symbolCounts, uid])

  return (
    <div className='w-full'>
      <div className='flex flex-wrap gap-3'>
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
