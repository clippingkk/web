import React from 'react'
import { useTranslation } from 'react-i18next'
import { usePageTrack, useTitle } from '../../hooks/tracke'

function SquarePage() {
  usePageTrack('square')
  const { t } = useTranslation()
  useTitle(t('app.square.title'))
  return (
    <section className='flex items-center justify-center'>
      <div className='my-12 rounded-sm text-6xl font-light shadow-2xl p-8'>
        🤦‍♂️ {t('app.common.closed')}
      </div>
    </section>
  )
}

export default SquarePage
