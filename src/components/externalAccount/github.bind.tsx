import React from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import WithLoading from '../with-loading'

type GithubBindButtonProps = {
}

function GithubBindButton(props: GithubBindButtonProps) {
  const { t } = useTranslation()
  return (
    <WithLoading
      loading={false}
    >
      <button
        className='px-4 py-2 rounded hover:shadow-lg bg-purple-400 flex justify-center items-center hover:scale-105 duration-150 disabled:bg-gray-400 disabled:hover:scale-100 disabled:hover:shadow-none w-full'
        onClick={() => {
          toast.info('not support yet')
        }}
      >
        {t('app.common.bind')}
      </button>
    </WithLoading>
  )
}

export default GithubBindButton
