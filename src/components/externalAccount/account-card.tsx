import { Check, ExternalLink } from 'lucide-react'

import { useTranslation } from '@/i18n/client'

type AccountCardProps = {
  icon: React.ReactNode
  title: string
  isBound: boolean
  accountInfo?: string[] | string
  bindComponent?: React.ReactNode
}

const AccountCard = ({
  icon,
  title,
  isBound,
  accountInfo,
  bindComponent,
}: AccountCardProps) => {
  const { t } = useTranslation()

  return (
    <div className="relative flex items-start gap-4 rounded-lg bg-white p-4 transition-all duration-200 hover:shadow-md dark:bg-gray-800/80 dark:backdrop-blur-sm dark:hover:shadow-gray-900/30">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100/80 p-3 dark:bg-gray-700/50">
        {icon}
      </div>

      <div className="flex-1">
        <div className="mb-1 flex items-center justify-between">
          <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
            {title}
          </h4>
          {isBound && (
            <span className="flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <Check size={12} className="mr-1" />
              {t('app.common.bound')}
            </span>
          )}
        </div>

        {isBound ? (
          <div className="mt-2">
            {Array.isArray(accountInfo) ? (
              <ul className="space-y-1">
                {accountInfo.map((info) => (
                  <li
                    key={info}
                    className="flex items-center text-sm break-all text-gray-600 dark:text-gray-400"
                  >
                    <ExternalLink size={12} className="mr-1 flex-shrink-0" />
                    {info}
                  </li>
                ))}
              </ul>
            ) : (
              accountInfo && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {accountInfo}
                </p>
              )
            )}
          </div>
        ) : (
          <div className="mt-2">{bindComponent}</div>
        )}
      </div>
    </div>
  )
}

export default AccountCard
