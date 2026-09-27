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
  recent: { id: number; name: string }[]
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
      recent:
        group?.recently.map((r) => ({ id: r.id, name: r.creator.name })) ?? [],
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
  const [synced, setSynced] = useState({ symbolCounts, viewerId })
  // Fresh server data (after router.refresh) replaces the optimistic state;
  // that is how a reaction created here learns the id it needs to be removed.
  if (synced.symbolCounts !== symbolCounts || synced.viewerId !== viewerId) {
    setSynced({ symbolCounts, viewerId })
    setState(toState(symbolCounts, viewerId))
  }
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
    // just created here and the refresh carrying its id hasn't landed yet
    if (before.done && !before.reactionId) return
    const removing = before.done
    setPending(symbol)
    setState((s) => ({
      ...s,
      [symbol]: removing
        ? {
            count: Math.max(0, before.count - 1),
            done: false,
            recent: before.recent.filter((r) => r.id !== before.reactionId),
          }
        : { ...before, count: before.count + 1, done: true },
    }))
    try {
      if (removing && before.reactionId) {
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
        // the mutation returns no id; the refreshed props bring it back
        startTransition(() => router.refresh())
      }
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
            // a reaction added here waits for its id before it can be undone
            disabled={pending === symbol || (item.done && !item.reactionId)}
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
            {item.recent.length > 0 ? (
              <Tooltip
                content={t('reactions.reactedBy', {
                  names: item.recent
                    .slice(0, 5)
                    .map((r) => r.name)
                    .join(', '),
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
