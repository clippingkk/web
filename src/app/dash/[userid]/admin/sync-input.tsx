import { useApolloClient } from '@apollo/client'
import { LinkIcon } from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useTranslation } from '@/i18n/client'
import { useSyncHomelessBookMutation } from '@/schema/generated'
import { toastPromiseDefaultOption } from '@/services/misc'

type HomelessBookSyncInputProps = {
  bookName: string
}

function HomelessBookSyncInput(props: HomelessBookSyncInputProps) {
  const client = useApolloClient()
  const [doubanId, setDoubanId] = useState('')
  const [doSyncHomelessBook] = useSyncHomelessBookMutation()
  const { t } = useTranslation()

  const onConfirm = useCallback(() => {
    if (!doubanId.trim()) {
      toast.error(t('Please enter a valid Douban ID'))
      return
    }

    toast
      .promise(
        doSyncHomelessBook({
          variables: {
            title: props.bookName,
            doubanID: doubanId,
          },
        }),
        toastPromiseDefaultOption
      )
      .then(() => {
        client.resetStore()
        setDoubanId('')
      })
  }, [doubanId, client, props.bookName, t, doSyncHomelessBook])

  return (
    <div className='flex items-center space-x-2'>
      <div className='relative flex-1'>
        <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
          <LinkIcon className='h-4 w-4 text-gray-500' />
        </div>
        <input
          type='text'
          value={doubanId}
          onChange={(e) => setDoubanId(e.target.value)}
          placeholder={t('Douban ID')}
          className='block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
        />
      </div>
      <button
        onClick={onConfirm}
        className='inline-flex items-center px-4 py-2 border border-indigo-500 text-sm font-medium rounded-md shadow-sm text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'
      >
        {t('Confirm')}
      </button>
    </div>
  )
}

export default HomelessBookSyncInput
