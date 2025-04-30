import { useTranslation } from '@/i18n/client'
import { Check, ExternalLink } from 'lucide-react'

type AccountCardProps = {
  icon: React.ReactNode
  title: string
  isBound: boolean
  accountInfo?: string[] | string
  bindComponent?: React.ReactNode
}

const AccountCard = ({ icon, title, isBound, accountInfo, bindComponent }: AccountCardProps) => {
  const { t } = useTranslation()
  
  return (
    <div className="relative flex items-start gap-4 p-4 transition-all duration-200 bg-white rounded-lg dark:bg-gray-800/80 dark:backdrop-blur-sm hover:shadow-md dark:hover:shadow-gray-900/30">
      <div className="flex items-center justify-center w-12 h-12 p-3 rounded-full bg-gray-100/80 dark:bg-gray-700/50">
        {icon}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">{title}</h4>
          {isBound && (
            <span className="flex items-center px-2 py-1 text-xs font-medium text-green-600 bg-green-100 rounded-full dark:bg-green-900/30 dark:text-green-400">
              <Check size={12} className="mr-1" />
              {t('app.common.bound')}
            </span>
          )}
        </div>
        
        {isBound ? (
          <div className="mt-2">
            {Array.isArray(accountInfo) ? (
              <ul className="space-y-1">
                {accountInfo.map(info => (
                  <li key={info} className="flex items-center text-sm text-gray-600 dark:text-gray-400 break-all">
                    <ExternalLink size={12} className="mr-1 flex-shrink-0" />
                    {info}
                  </li>
                ))}
              </ul>
            ) : (
              accountInfo && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{accountInfo}</p>
              )
            )}
          </div>
        ) : (
          <div className="mt-2">
            {bindComponent}
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountCard
