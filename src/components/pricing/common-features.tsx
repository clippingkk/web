import { BookOpen, Globe, Shield } from 'lucide-react'
import { getTranslation } from '@/i18n'

async function CommonFeatures() {
  const { t } = await getTranslation()
  return (
    <>
      <li className='flex items-start'>
        <BookOpen className='h-5 w-5 mr-3 text-emerald-400 mt-1 flex-shrink-0' />
        <span>{t('app.common.unlimited.books')}</span>
      </li>
      <li className='flex items-start'>
        <Globe className='h-5 w-5 mr-3 text-teal-400 mt-1 flex-shrink-0' />
        <span>{t('app.common.web.access')}</span>
      </li>
      <li className='flex items-start'>
        <Shield className='h-5 w-5 mr-3 text-sky-400 mt-1 flex-shrink-0' />
        <span>{t('app.common.data.security')}</span>
      </li>
    </>
  )
}

export default CommonFeatures
