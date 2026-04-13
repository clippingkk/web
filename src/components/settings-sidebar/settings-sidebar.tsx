'use client'
import { FileDown, Globe, List, Settings, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useTranslation } from '@/i18n/client'

import LinkIndicator from '../link-indicator'

type SettingsSidebarProps = {
  title: string
}

function SettingsSidebar({ title }: SettingsSidebarProps) {
  const { t } = useTranslation()
  const pathname = usePathname()

  // Extract basePath using regex pattern matching
  const match = pathname?.match(/dash\/(.*)\/settings\/(\w+)/)
  const basePath = match ? `/dash/${match[1]}/settings` : ''
  const activeKey = match ? match[2] : ''

  const tabs = [
    {
      id: 'web',
      label: t('app.settings.title'),
      icon: <Settings className="h-4 w-4" />,
    },
    {
      id: 'orders',
      label: t('app.settings.orders.title'),
      icon: <List className="h-4 w-4" />,
    },
    {
      id: 'webhooks',
      label: t('app.settings.webhook.title'),
      icon: <Globe className="h-4 w-4" />,
    },
    {
      id: 'exports',
      label: t('app.settings.export.title'),
      icon: <FileDown className="h-4 w-4" />,
    },
    {
      id: 'account',
      label: t('app.settings.account'),
      icon: <User className="h-4 w-4" />,
      className: 'ml-auto',
    },
  ]

  return (
    <div className="w-1/4 min-w-[200px] border-r border-slate-300/50 bg-gradient-to-b from-slate-100/50 to-slate-200/50 backdrop-blur-md dark:border-slate-700/50 dark:from-slate-800/50 dark:to-slate-900/50">
      <div className="px-3 py-10">
        <h2 className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text px-4 text-xl font-bold text-transparent dark:from-blue-400 dark:to-purple-500">
          {title}
        </h2>
        <div className="space-y-1">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={`${basePath}/${tab.id}` as any}
              className={`group flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ease-in-out ${tab.className || ''} ${
                activeKey === tab.id
                  ? 'bg-gradient-to-r from-blue-600/20 to-blue-500/10 text-blue-700 shadow-sm dark:from-blue-500/20 dark:to-blue-400/10 dark:text-blue-400'
                  : 'text-slate-700 hover:translate-x-1 hover:bg-slate-200/80 dark:text-slate-300 dark:hover:bg-slate-700/30'
              } `}
            >
              <LinkIndicator>
                <span
                  className={` ${
                    activeKey === tab.id
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-500 group-hover:text-blue-500 dark:text-slate-400 dark:group-hover:text-blue-400'
                  } `}
                >
                  {tab.icon}
                </span>
              </LinkIndicator>
              <span
                className={`transition-all duration-200 ${activeKey === tab.id ? 'font-semibold' : ''}`}
              >
                {tab.label}
              </span>
              {activeKey === tab.id && (
                <span className="ml-auto h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400"></span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SettingsSidebar
