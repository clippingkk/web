import { useApolloClient } from '@apollo/client/react'
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
    <div className="flex items-center gap-3">
      <div className="relative min-w-0 flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <LinkIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        </div>
        <input
          type="text"
          value={doubanId}
          onChange={(e) => setDoubanId(e.target.value)}
          placeholder={t('Douban ID')}
          className="block w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-3 pl-10 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
        />
      </div>
      <button
        onClick={onConfirm}
        className="inline-flex flex-shrink-0 items-center rounded-lg bg-blue-400 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-500 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:outline-none dark:bg-blue-400 dark:hover:bg-blue-500"
      >
        {t('Confirm')}
      </button>
    </div>
  )
}

export default HomelessBookSyncInput
