import Link from 'next/link'

import { getTranslation } from '@/i18n'

type TNoContentProps = {
  domain: string
}

async function NoContentAlert({ domain }: TNoContentProps) {
  const { t } = await getTranslation()
  return (
    <Link
      href={`/dash/${domain}/upload`}
      className="bg-opacity-75 flex flex-col items-center justify-center rounded-sm bg-gray-300 px-64 py-40 shadow-lg dark:bg-gray-700"
    >
      <h3 className="mt-0 text-5xl">{t('app.home.notfound')}</h3>
      <h3 className="mt-0 text-5xl">{t('app.home.uploadTip')}</h3>
    </Link>
  )
}

export default NoContentAlert
