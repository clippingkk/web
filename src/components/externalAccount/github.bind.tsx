import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

import WithLoading from '../with-loading'

function GithubBindButton() {
  const { t } = useTranslation()
  return (
    <WithLoading loading={false}>
      <button
        className="flex w-full items-center justify-center rounded-sm bg-purple-400 px-4 py-2 duration-150 hover:scale-105 hover:shadow-lg disabled:bg-gray-400 disabled:hover:scale-100 disabled:hover:shadow-none"
        onClick={() => {
          toast.error('not support yet')
        }}
      >
        {t('app.common.bind')}
      </button>
    </WithLoading>
  )
}

export default GithubBindButton
