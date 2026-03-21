'use client'

import { BookOpen, MessageCircle } from 'lucide-react'
import { useState } from 'react'

import ClippingList from '@/app/dash/[userid]/profile/clipping-list'
import RecentComments from '@/components/recent-comments/recent-comments'
import { useTranslation } from '@/i18n/client'
import type { ProfileQuery } from '@/schema/generated'

type ProfileTabsProps = {
  uid: number
  userDomain?: string | null
  profile: ProfileQuery['me']
}

type TabType = 'clippings' | 'comments'

const ProfileTabs = ({ uid, userDomain, profile }: ProfileTabsProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('clippings')
  const { t } = useTranslation()

  const tabs = [
    {
      id: 'clippings' as TabType,
      label: t('app.profile.recents'),
      icon: BookOpen,
      count: profile.clippingsCount,
    },
    {
      id: 'comments' as TabType,
      label: t('app.clipping.comments.title'),
      icon: MessageCircle,
      count: profile.commentList.count,
    },
  ]

  return (
    <div className="w-full space-y-8">
      {/* Enhanced Tab Navigation */}
      <div className="flex items-center justify-center gap-6">
        <div className="h-px flex-grow bg-gradient-to-r from-transparent via-blue-200/50 to-transparent dark:via-blue-400/20"></div>

        {/* Main tab container */}
        <div className="group relative">
          {/* Background glow */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-20 blur transition-opacity duration-500 group-hover:opacity-30"></div>

          {/* Tab buttons container */}
          <div className="relative flex rounded-2xl border border-white/40 bg-white/70 p-1.5 shadow-xl backdrop-blur-xl dark:border-gray-700/40 dark:bg-gray-900/70">
            {/* Active tab indicator */}
            <div
              className={`absolute top-1.5 h-11 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg transition-all duration-300 ease-out ${
                activeTab === 'clippings'
                  ? 'left-1.5 w-[calc(50%-0.375rem)]'
                  : 'left-1/2 w-[calc(50%-0.375rem)]'
              }`}
            />

            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative z-10 flex min-w-[120px] items-center justify-center gap-3 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? 'scale-105 transform text-white'
                      : 'text-gray-700 hover:scale-102 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 transition-all duration-300 ${isActive ? 'animate-pulse' : ''}`}
                  />
                  <span className="font-medium">{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold transition-all duration-300 ${
                        isActive
                          ? 'bg-white/30 text-white shadow-sm'
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

        <div className="h-px flex-grow bg-gradient-to-r from-transparent via-blue-200/50 to-transparent dark:via-blue-400/20"></div>
      </div>

      {/* Enhanced Tab Content */}
      <div className="relative">
        {/* Content background with animated glow */}
        <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r blur-xl"></div>

        <div className="relative overflow-hidden rounded-3xl shadow-2xl backdrop-blur-xl">
          {/* Animated content transition */}
          <div className="transition-all duration-500 ease-out">
            {activeTab === 'clippings' && (
              <div className="animate-fade-in">
                <ClippingList uid={uid} userDomain={userDomain || ''} />
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="animate-fade-in">
                <RecentComments
                  commentList={profile.commentList}
                  userId={profile.id}
                  userDomain={profile.domain}
                  // showHeader={false}
                  maxItems={10}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileTabs
