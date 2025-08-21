import { useTranslation } from '@/i18n/client'

function Empty() {
  const { t } = useTranslation()
  return (
    <div className='flex h-96 w-full flex-col items-center justify-center'>
      <span className='text-9xl'>🤨</span>
      <p className='mt-2'>{t('app.menu.search.empty')}</p>
    </div>
  )
}

export default Empty
