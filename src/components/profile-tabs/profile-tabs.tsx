'use client'

import React, { useState } from 'react'
import { BookOpen, MessageCircle } from 'lucide-react'
import { useTranslation } from '@/i18n/client'
import { ProfileQuery } from '@/schema/generated'
import ClippingList from '@/app/dash/[userid]/profile/clipping-list'
import RecentComments from '@/components/recent-comments/recent-comments'

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
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="mb-8 flex items-center justify-center gap-4">
        <div className="h-px flex-grow bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>
        
        <div className="flex rounded-xl bg-white/50 p-1 shadow-lg backdrop-blur-md dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
                  ? 'bg-blue-500 text-white shadow-md transform scale-105'
                  : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        
        <div className="h-px flex-grow bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>
      </div>

      {/* Tab Content */}
      <div className="rounded-2xl shadow-lg backdrop-blur-md">
        {activeTab === 'clippings' && (
          <ClippingList uid={uid} userDomain={userDomain || ''} />
        )}
        
        {activeTab === 'comments' && (
          <RecentComments 
            commentList={profile.commentList}
            userId={profile.id}
            userDomain={profile.domain}
            showHeader={false}
            maxItems={10}
          />
        )}
      </div>
    </div>
  )
}

export default ProfileTabs