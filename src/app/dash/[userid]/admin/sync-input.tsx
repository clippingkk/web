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
    <div className='flex items-center gap-3'>
      <div className='relative flex-1 min-w-0'>
        <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
          <LinkIcon className='h-4 w-4 text-gray-400 dark:text-gray-500' />
        </div>
        <input
          type='text'
          value={doubanId}
          onChange={(e) => setDoubanId(e.target.value)}
          placeholder={t('Douban ID')}
          className='block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200'
        />
      </div>
      <button
        onClick={onConfirm}
        className='inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-lg shadow-sm text-white bg-blue-400 hover:bg-blue-500 dark:bg-blue-400 dark:hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition-all duration-200 flex-shrink-0'
      >
        {t('Confirm')}
      </button>
    </div>
  )
}

export default HomelessBookSyncInput
