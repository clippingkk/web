import { getTranslation } from '@/i18n'

interface PremiumBadgeProps {
  className?: string
}

async function PremiumBadge({ className = '' }: PremiumBadgeProps) {
  const { t } = await getTranslation()

  return (
    <span
      className={`ml-2 inline-block rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-2 py-1 text-xs font-medium text-white ${className}`}
    >
      {t('common.premium')}
    </span>
  )
}

export default PremiumBadge
