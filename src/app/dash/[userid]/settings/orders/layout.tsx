import { CreditCard } from 'lucide-react'
import type React from 'react'

import { getTranslation } from '@/i18n'

import SettingsSectionLayout from '../components/SettingsSectionLayout'

async function SettingsOrdersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { t } = await getTranslation()
  return (
    <SettingsSectionLayout
      icon={
        <CreditCard className="h-8 w-8 text-green-600 dark:text-green-400" />
      }
      iconBgClass="bg-green-100 dark:bg-green-900/30"
      title={t('app.settings.orders.title', 'Order History')}
      description={t(
        'app.settings.orders.description',
        'Review your past purchases and subscription history. Manage your payment information and view receipts.'
      )}
    >
      {children}
    </SettingsSectionLayout>
  )
}

export default SettingsOrdersLayout
