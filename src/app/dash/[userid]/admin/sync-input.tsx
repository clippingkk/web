import React, { useState, useCallback } from 'react'
import { useApolloClient } from '@apollo/client'
import { SyncHomelessBookDocument, useSyncHomelessBookMutation } from '../../../../schema/generated'
import { toast } from 'react-hot-toast'
import { toastPromiseDefaultOption } from '../../../../services/misc'

type HomelessBookSyncInputProps = {
  bookName: string
}

function HomelessBookSyncInput(props: HomelessBookSyncInputProps) {
  const client = useApolloClient()
  const [doubanId, setDoubanId] = useState('')
  const [doSyncHomelessBook] = useSyncHomelessBookMutation()
  const onConfirm = useCallback(() => {
    toast.promise(doSyncHomelessBook({
      variables: {
        title: props.bookName,
        doubanID: doubanId
      }
    }), toastPromiseDefaultOption).then(() => {
      client.resetStore()
    })
  }, [doubanId, client])

  return (
    <div className='flex'>
      <input
        value={doubanId}
        onChange={e => setDoubanId(e.target.value)}
        type='number'
        placeholder='douban id'
        className='p-2 rounded mr-2 focus:outline-none hover:border-b-2 border-blue-400 transition-all duration-300'
      />
      <button
        className='p-2 bg-blue-400 rounded hover:bg-blue-600 focus:outline-none'
        onClick={onConfirm}
      >confirm</button>
    </div>
  )
}

export default HomelessBookSyncInput
