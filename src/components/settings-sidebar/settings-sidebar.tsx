'use client'
import { useTranslation } from '@/i18n/client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { Cog8ToothIcon, DocumentArrowDownIcon, GlobeAltIcon, QueueListIcon, UserIcon } from '@heroicons/react/24/outline'
import LinkIndicator from '../link-indicator'

type SettingsSidebarProps = {
  title: string
}

function SettingsSidebar({ title }: SettingsSidebarProps) {
  const { t } = useTranslation()
  const pathname = usePathname()
  const paths = pathname?.split('/')
  const activeKey = paths.pop()
  const basePath = paths.join('/')

  const tabs = [
    { id: 'web', label: t('app.settings.title'), icon: <Cog8ToothIcon className='w-4 h-4' /> },
    { id: 'orders', label: t('app.settings.orders.title'), icon: <QueueListIcon className='w-4 h-4' /> },
    { id: 'webhooks', label: t('app.settings.webhook.title'), icon: <GlobeAltIcon className='w-4 h-4' /> },
    { id: 'exports', label: t('app.settings.export.title'), icon: <DocumentArrowDownIcon className='w-4 h-4' /> },
    { id: 'account', label: 'Account', icon: <UserIcon className='w-4 h-4' />, className: 'ml-auto' }
  ]

  return (
    <div className='w-1/4 min-w-[200px] border-r border-slate-300/50 dark:border-slate-700/50 bg-gradient-to-b from-slate-100/50 to-slate-200/50 dark:from-slate-800/50 dark:to-slate-900/50 backdrop-blur-md'>
      <div className='py-10 px-3'>
        <h2 className='text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 mb-6 px-4'>
          {title}
        </h2>
        <div className='space-y-1'>
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={`${basePath}/${tab.id}`}
              className={`
                group flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out
                ${tab.className || ''}
                ${activeKey === tab.id
              ? 'bg-gradient-to-r from-blue-600/20 to-blue-500/10 dark:from-blue-500/20 dark:to-blue-400/10 text-blue-700 dark:text-blue-400 shadow-sm'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700/30 hover:translate-x-1'}
              `}
            >
              <LinkIndicator>
                <span className={`
                ${activeKey === tab.id 
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400'}
              `}>
                  {tab.icon}
                </span>
              </LinkIndicator>
              <span className={`transition-all duration-200 ${activeKey === tab.id ? 'font-semibold' : ''}`}>
                {tab.label}
              </span>
              {activeKey === tab.id && (
                <span className='ml-auto h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400'></span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SettingsSidebar
