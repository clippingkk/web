import Link from 'next/link'
import React from 'react'
import { useTranslation } from '@/i18n'

type TNoContentProps = {
  domain: string
}

async function NoContentAlert({ domain }: TNoContentProps) {
  const { t } = await useTranslation()
  return (
    (<Link
      href={`/dash/${domain}/upload`}
      className='bg-gray-300 rounded-sm shadow-lg py-40 px-64 flex items-center justify-center flex-col bg-opacity-75 dark:bg-gray-700'>

      <h3 className='text-5xl mt-0'>{t('app.home.notfound')}</h3>
      <h3 className='text-5xl mt-0'>{t('app.home.uploadTip')}</h3>

    </Link>)
  )
}

export default NoContentAlert
