import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import WithLoading from '../with-loading'

function GithubBindButton() {
  const { t } = useTranslation()
  return (
    <WithLoading loading={false}>
      <button
        className='px-4 py-2 rounded-sm hover:shadow-lg bg-purple-400 flex justify-center items-center hover:scale-105 duration-150 disabled:bg-gray-400 disabled:hover:scale-100 disabled:hover:shadow-none w-full'
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
