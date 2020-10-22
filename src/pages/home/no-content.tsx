import React from 'react'
import { Link } from '@reach/router';
import { useTranslation } from 'react-i18next';

type TNoContentProps = {
  userid: number
}

function NoContentAlert({ userid }: TNoContentProps) {
  const { t } = useTranslation()
  return (
    <Link
     className='bg-gray-300 rounded shadow-lg py-40 px-64 flex items-center justify-center flex-col bg-opacity-75 dark:bg-gray-700'
      to={`/dash/${userid}/upload`}
      >
      <h3 className='text-5xl mt-0'>{t('app.home.notfound')}</h3>
      <h3 className='text-5xl mt-0'>{t('app.home.uploadTip')}</h3>
    </Link>
  )
}

export default NoContentAlert
