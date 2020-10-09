import React from 'react'
import { useTranslation } from 'react-i18next'
import { usePageTrack, useTitle } from '../../hooks/tracke'

function SquarePage() {
  usePageTrack('square')
  const { t } = useTranslation()
  useTitle(t('app.square.title'))
  return (
    <section className='flex items-center justify-center'>
      <div className='my-12 rounded-sm text-6xl font-light shadow-2xl p-8 flex flex-col justify-center items-center '>
        <span>🤦‍♂️ </span>
        <span>{t('app.common.closed')}</span>
      </div>
    </section>
  )
}

export default SquarePage
