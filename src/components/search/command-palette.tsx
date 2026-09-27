'use client'

import Kbd from '@annatarhe/lake-ui/kbd'
import Modal from '@annatarhe/lake-ui/modal'
import Spinner from '@annatarhe/lake-ui/spinner'
import { useLazyQuery } from '@apollo/client/react'
import {
  BookMarked,
  BookOpen,
  Clock,
  CornerDownLeft,
  LayoutGrid,
  Quote,
  Search,
  Settings,
  Upload,
  UserRound,
} from 'lucide-react'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'

import { splitClippingLines } from '@/components/clipping/clipping-text'
import { CommandSearchDocument } from '@/gql/graphql'
import { useTranslation } from '@/i18n/client'
import { cn } from '@/lib/utils'
import { resolveMediaUrl } from '@/utils/image'
import { clippingHref, dashHref } from '@/utils/profile.utils'

const RECENT_KEY = 'ck.search.recent'
const MIN_QUERY = 2

type Option = {
  id: string
  group: 'goTo' | 'recent' | 'mine' | 'community' | 'people'
  label: string
  detail?: string
  icon: React.ReactNode
  href?: Route
  query?: string
}

function readRecent(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY)
    return raw ? (JSON.parse(raw) as string[]).slice(0, 5) : []
  } catch {
    return []
  }
}

function saveRecent(query: string) {
  try {
    const next = [query, ...readRecent().filter((q) => q !== query)].slice(0, 5)
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {
    // storage may be unavailable; recent searches are a nicety
  }
}

function excerpt(content: string) {
  return splitClippingLines(content).join(' ').slice(0, 140)
}

type CommandPaletteProps = {
  open: boolean
  onClose: () => void
  viewer: { id: number; slug: string } | null
}

function CommandPalette({ open, onClose, viewer }: CommandPaletteProps) {
  const { t } = useTranslation(undefined, 'search')
  const router = useRouter()
  const listId = useId()
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  // tracked by id so the highlight stays put when results land and reorder
  const [activeId, setActiveId] = useState<string | null>(null)
  // mounted only while open (and never on the server), so read storage once
  const [recent] = useState<string[]>(() => readRecent())
  const listRef = useRef<HTMLDivElement>(null)
  const [search, { data, loading }] = useLazyQuery(CommandSearchDocument)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 250)
    return () => clearTimeout(id)
  }, [query])

  useEffect(() => {
    if (debounced.length < MIN_QUERY) return
    void search({ variables: { query: debounced, withMine: !!viewer } })
  }, [debounced, search, viewer])

  const options = useMemo<Option[]>(() => {
    const q = query.trim().toLowerCase()
    const pages: Option[] = viewer
      ? (
          [
            ['library', 'home', <BookOpen key="i" />],
            ['square', 'square', <LayoutGrid key="i" />],
            ['upload', 'upload', <Upload key="i" />],
            ['unchecked', 'unchecked', <BookMarked key="i" />],
            ['profile', 'profile', <UserRound key="i" />],
            ['settings', 'settings/web', <Settings key="i" />],
          ] as const
        ).map(([key, section, icon]) => ({
          id: `page-${key}`,
          group: 'goTo' as const,
          label: t(`pages.${key}`),
          icon,
          href: dashHref(viewer.slug, section),
        }))
      : []
    const goTo = pages.filter((p) => !q || p.label.toLowerCase().includes(q))

    if (q.length < MIN_QUERY) {
      const recentOptions: Option[] = recent.map((r) => ({
        id: `recent-${r}`,
        group: 'recent',
        label: r,
        icon: <Clock />,
        query: r,
      }))
      return [...recentOptions, ...goTo]
    }

    const mineIds = new Set(data?.mine?.clippings.map((c) => c.id) ?? [])
    const mine: Option[] = (data?.mine?.clippings ?? []).map((c) => ({
      id: `mine-${c.id}`,
      group: 'mine',
      label: excerpt(c.content),
      detail: c.title,
      icon: <Quote />,
      href: clippingHref(c.creator, c.id),
    }))
    const community: Option[] = (data?.community.clippings ?? [])
      .filter((c) => !mineIds.has(c.id))
      .map((c) => ({
        id: `community-${c.id}`,
        group: 'community',
        label: excerpt(c.content),
        detail: `${c.title} · ${c.creator.name}`,
        icon: <Quote />,
        href: clippingHref(c.creator, c.id),
      }))
    const people: Option[] = (data?.community.users ?? []).map((u) => ({
      id: `user-${u.id}`,
      group: 'people',
      label: u.name,
      detail: u.domain ? `@${u.domain}` : undefined,
      icon: u.avatar ? (
        <img
          src={resolveMediaUrl(u.avatar)}
          alt=""
          className="size-5 rounded-full object-cover"
        />
      ) : (
        <UserRound />
      ),
      href: dashHref(u, 'profile'),
    }))
    return [...goTo, ...mine, ...community, ...people]
  }, [query, viewer, recent, data, t])

  const active = Math.max(
    0,
    options.findIndex((o) => o.id === activeId)
  )

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const choose = (option?: Option) => {
    if (!option) return
    if (option.query) {
      setQuery(option.query)
      setActiveId(null)
      return
    }
    if (option.href) {
      if (query.trim().length >= MIN_QUERY) saveRecent(query.trim())
      onClose()
      router.push(option.href)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveId(options[Math.min(active + 1, options.length - 1)]?.id ?? null)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveId(options[Math.max(active - 1, 0)]?.id ?? null)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      choose(options[active])
    }
  }

  const searching = loading && query.trim().length >= MIN_QUERY
  const showEmpty =
    !searching &&
    debounced.length >= MIN_QUERY &&
    debounced === query.trim() &&
    options.length === 0
  const groups = ['recent', 'goTo', 'mine', 'community', 'people'] as const

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={t('title')}
      size="lg"
      className="sm:mt-[10vh] sm:self-start"
      bodyClassName="p-0 sm:p-0"
      footer={
        <div className="type-meta hidden items-center gap-4 sm:flex">
          <span className="inline-flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            {t('keys.navigate')}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Kbd>
              <CornerDownLeft className="size-3" aria-hidden="true" />
            </Kbd>
            {t('keys.open')}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Kbd>Esc</Kbd>
            {t('keys.close')}
          </span>
        </div>
      }
    >
      <div className="border-lake-line flex items-center gap-3 border-b px-4 py-3">
        <Search
          className="text-lake-fg-subtle size-5 shrink-0"
          aria-hidden="true"
        />
        <input
          data-autofocus
          type="search"
          role="combobox"
          aria-expanded={options.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            options[active] ? `${listId}-${options[active].id}` : undefined
          }
          aria-label={t('title')}
          placeholder={t('placeholder')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActiveId(null)
          }}
          onKeyDown={onKeyDown}
          className="text-lake-fg placeholder:text-lake-fg-subtle w-full bg-transparent text-base outline-none"
        />
        {searching ? <Spinner size="xs" label={t('searching')} /> : null}
      </div>
      <div className="max-h-[min(60vh,28rem)] overflow-y-auto p-2">
        {showEmpty ? (
          <p className="type-meta px-3 py-8 text-center">
            {t('empty', { query: debounced })}
          </p>
        ) : null}
        {!viewer && query.trim().length < MIN_QUERY ? (
          <p className="type-meta px-3 py-8 text-center">{t('hint')}</p>
        ) : null}
        {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- a combobox popup can't be a native <select> */}
        <div id={listId} role="listbox" ref={listRef} aria-label={t('title')}>
          {groups.map((group) => {
            const groupOptions = options.filter((o) => o.group === group)
            if (groupOptions.length === 0) return null
            return (
              <div key={group} role="presentation" className="pb-2">
                <p
                  role="presentation"
                  className="type-eyebrow px-3 pt-2 pb-1.5"
                >
                  {t(group)}
                </p>
                <div role="presentation">
                  {groupOptions.map((option) => {
                    const index = options.indexOf(option)
                    const selected = index === active
                    return (
                      <div
                        key={option.id}
                        id={`${listId}-${option.id}`}
                        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- an option of the combobox popup
                        role="option"
                        tabIndex={-1}
                        aria-selected={selected}
                        data-index={index}
                        onMouseMove={() => setActiveId(option.id)}
                        onClick={() => choose(option)}
                        className={cn(
                          'rounded-lake-control flex cursor-pointer items-start gap-3 px-3 py-2',
                          selected
                            ? 'bg-lake-surface-muted text-lake-fg'
                            : 'text-lake-fg-muted'
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className="text-lake-fg-subtle mt-0.5 shrink-0 [&_svg]:size-4"
                        >
                          {option.icon}
                        </span>
                        <span className="flex min-w-0 flex-col">
                          <span
                            className={cn(
                              'line-clamp-2 text-sm',
                              option.group === 'mine' ||
                                option.group === 'community'
                                ? 'font-reading text-lake-fg'
                                : 'text-lake-fg font-medium'
                            )}
                          >
                            {option.label}
                          </span>
                          {option.detail ? (
                            <span className="type-meta truncate">
                              {option.detail}
                            </span>
                          ) : null}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Modal>
  )
}

export default CommandPalette
