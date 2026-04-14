'use client'

import { BookOpen, MessageCircle, type LucideIcon } from 'lucide-react'
import { useId, useRef, useState, type KeyboardEvent } from 'react'

import ClippingList from '@/app/dash/[userid]/profile/clipping-list'
import RecentComments from '@/components/recent-comments/recent-comments'
import { useTranslation } from '@/i18n/client'
import type { FetchClippingsByUidQuery, ProfileQuery } from '@/schema/generated'

type ProfileTabsProps = {
  uid: number
  userDomain?: string | null
  profile: ProfileQuery['me']
  initialClippings?: FetchClippingsByUidQuery['clippingList']
}

type TabType = 'clippings' | 'comments'

type TabDef = {
  id: TabType
  label: string
  icon: LucideIcon
  count: number
}

const ProfileTabs = ({
  uid,
  userDomain,
  profile,
  initialClippings,
}: ProfileTabsProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('clippings')
  const { t } = useTranslation()
  const groupId = useId()
  const tabRefs = useRef<Record<TabType, HTMLButtonElement | null>>({
    clippings: null,
    comments: null,
  })

  const tabs: TabDef[] = [
    {
      id: 'clippings',
      label: t('app.profile.recents'),
      icon: BookOpen,
      count: profile.clippingsCount,
    },
    {
      id: 'comments',
      label: t('app.clipping.comments.title'),
      icon: MessageCircle,
      count: profile.commentList.count,
    },
  ]

  const tabIdOf = (id: TabType) => `${groupId}-tab-${id}`
  const panelIdOf = (id: TabType) => `${groupId}-panel-${id}`

  const focusTab = (id: TabType) => {
    setActiveTab(id)
    tabRefs.current[id]?.focus()
  }

  const onTabKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const idx = tabs.findIndex((tab) => tab.id === activeTab)
    if (idx < 0) return
    switch (e.key) {
      case 'ArrowRight': {
        e.preventDefault()
        focusTab(tabs[(idx + 1) % tabs.length].id)
        break
      }
      case 'ArrowLeft': {
        e.preventDefault()
        focusTab(tabs[(idx - 1 + tabs.length) % tabs.length].id)
        break
      }
      case 'Home': {
        e.preventDefault()
        focusTab(tabs[0].id)
        break
      }
      case 'End': {
        e.preventDefault()
        focusTab(tabs[tabs.length - 1].id)
        break
      }
    }
  }

  return (
    <div className="w-full">
      <div className="flex justify-center">
        <div className="group relative">
          <div
            aria-hidden
            className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-400 via-indigo-400 to-sky-400 opacity-15 blur transition-opacity duration-500 group-hover:opacity-25"
          />

          <div
            role="tablist"
            aria-label="Profile sections"
            onKeyDown={onTabKeyDown}
            className="relative flex rounded-2xl border border-white/40 bg-white/70 p-1.5 shadow-sm backdrop-blur-xl dark:border-slate-800/40 dark:bg-slate-900/70"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabRefs.current[tab.id] = el
                  }}
                  id={tabIdOf(tab.id)}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  aria-controls={panelIdOf(tab.id)}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center justify-center gap-2.5 rounded-xl px-5 py-2.5 text-sm font-semibold transition-[background-color,color,box-shadow,transform] duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent motion-reduce:transition-none ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-sm'
                      : 'text-gray-600 hover:-translate-y-0.5 hover:bg-blue-50/60 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-slate-800/60 dark:hover:text-gray-50'
                  }`}
                >
                  <Icon aria-hidden className="h-4 w-4 shrink-0" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      className={`hidden min-w-[1.5rem] rounded-full px-2 py-0.5 text-center text-xs font-semibold tabular-nums transition-colors duration-200 sm:inline-block ${
                        isActive
                          ? 'bg-white/25 text-white'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-8">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          if (!isActive) return null
          return (
            <div
              key={tab.id}
              id={panelIdOf(tab.id)}
              role="tabpanel"
              aria-labelledby={tabIdOf(tab.id)}
              tabIndex={0}
              className="animate-fade-in focus:outline-none"
            >
              {tab.id === 'clippings' && (
                <ClippingList
                  uid={uid}
                  userDomain={userDomain || ''}
                  initialClippings={initialClippings}
                />
              )}
              {tab.id === 'comments' && (
                <RecentComments
                  commentList={profile.commentList}
                  userId={profile.id}
                  userDomain={profile.domain}
                  maxItems={10}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ProfileTabs
