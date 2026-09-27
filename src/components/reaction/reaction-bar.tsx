'use client'

import Tooltip from '@annatarhe/lake-ui/tooltip'
import { useMutation } from '@apollo/client/react'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'react-hot-toast'

import {
  type FetchClippingQuery,
  ReactionCreateDocument,
  ReactionRemoveDocument,
} from '@/gql/graphql'
import { useTranslation } from '@/i18n/client'
import { authHref } from '@/lib/auth-href'
import { cn } from '@/lib/utils'
import { ReactionTarget } from '@/schema/generated'

export const REACTION_SYMBOLS = ['👍', '❤️', '⭐️', '🐶', '😱'] as const

type SymbolCount =
  FetchClippingQuery['clipping']['reactionData']['symbolCounts'][number]

type ReactionState = {
  count: number
  done: boolean
  reactionId?: number
  names: string[]
}

function toState(
  symbolCounts: SymbolCount[],
  viewerId?: number | null
): Record<string, ReactionState> {
  const state: Record<string, ReactionState> = {}
  for (const symbol of REACTION_SYMBOLS) {
    const group = symbolCounts.find((g) => g.symbol === symbol)
    state[symbol] = {
      count: group?.count ?? 0,
      done: group?.done ?? false,
      reactionId: group?.recently.find((r) => r.creator.id === viewerId)?.id,
      names: group?.recently.map((r) => r.creator.name) ?? [],
    }
  }
  return state
}

type ReactionBarProps = {
  clippingId: number
  viewerId?: number | null
  symbolCounts: SymbolCount[]
}

/** Emoji reactions with optimistic counts; signed-out readers go to sign-in. */
function ReactionBar({ clippingId, viewerId, symbolCounts }: ReactionBarProps) {
  const { t } = useTranslation(undefined, 'reading')
  const router = useRouter()
  const pathname = usePathname()
  const [state, setState] = useState(() => toState(symbolCounts, viewerId))
  const [pending, setPending] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const [createReaction] = useMutation(ReactionCreateDocument)
  const [removeReaction] = useMutation(ReactionRemoveDocument)

  const onToggle = async (symbol: string) => {
    if (!viewerId) {
      router.push(authHref(pathname))
      return
    }
    const before = state[symbol]
    if (before.done && !before.reactionId) {
      // our reaction isn't in the "recently" window; refresh to learn its id
      startTransition(() => router.refresh())
      return
    }
    setPending(symbol)
    setState((s) => ({
      ...s,
      [symbol]: {
        ...before,
        done: !before.done,
        count: Math.max(0, before.count + (before.done ? -1 : 1)),
      },
    }))
    try {
      if (before.done && before.reactionId) {
        await removeReaction({
          variables: { rid: before.reactionId, symbol },
        })
      } else {
        await createReaction({
          variables: {
            target: ReactionTarget.Clipping,
            targetId: clippingId,
            symbol,
          },
        })
      }
      startTransition(() => router.refresh())
    } catch {
      setState((s) => ({ ...s, [symbol]: before }))
      toast.error(t('reactions.failed'))
    } finally {
      setPending(null)
    }
  }

  return (
    <ul aria-label={t('reactions.label')} className="flex flex-wrap gap-2">
      {REACTION_SYMBOLS.map((symbol) => {
        const item = state[symbol]
        const button = (
          <button
            type="button"
            aria-pressed={item.done}
            disabled={pending === symbol}
            onClick={() => onToggle(symbol)}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm tabular-nums transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-lake-ring disabled:opacity-60',
              item.done
                ? 'border-lake-accent/40 bg-lake-accent-soft text-lake-accent-text'
                : 'border-lake-line text-lake-fg-muted hover:bg-lake-surface-muted hover:text-lake-fg'
            )}
          >
            <span aria-hidden="true" className="text-base leading-none">
              {symbol}
            </span>
            {item.count > 0 ? <span>{item.count}</span> : null}
          </button>
        )
        return (
          <li key={symbol}>
            {item.names.length > 0 ? (
              <Tooltip
                content={t('reactions.reactedBy', {
                  names: item.names.slice(0, 5).join(', '),
                })}
              >
                {button}
              </Tooltip>
            ) : (
              button
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default ReactionBar
