import { BookOpen, Globe, Shield } from 'lucide-react'

import { getTranslation } from '@/i18n'

async function CommonFeatures() {
  const { t } = await getTranslation()
  return (
    <>
      <li className="flex items-start">
        <BookOpen className="mt-1 mr-3 h-5 w-5 flex-shrink-0 text-emerald-400" />
        <span>{t('app.common.unlimited.books')}</span>
      </li>
      <li className="flex items-start">
        <Globe className="mt-1 mr-3 h-5 w-5 flex-shrink-0 text-teal-400" />
        <span>{t('app.common.web.access')}</span>
      </li>
      <li className="flex items-start">
        <Shield className="mt-1 mr-3 h-5 w-5 flex-shrink-0 text-sky-400" />
        <span>{t('app.common.data.security')}</span>
      </li>
    </>
  )
}

export default CommonFeatures
