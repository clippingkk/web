import React, { useState, useCallback } from 'react'
import { useApolloClient } from '@apollo/client'
import { useSyncHomelessBookMutation } from '../../../../schema/generated'
import { toast } from 'react-hot-toast'
import { toastPromiseDefaultOption } from '../../../../services/misc'
import { Button, Input } from '@mantine/core'

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
    <div className='flex items-center'>
      <Input
        value={doubanId}
        onChange={e => setDoubanId(e.target.value)}
        placeholder='douban id'
      />
      <Button
        className=''
        variant='outline'
        onClick={onConfirm}
      >confirm</Button>
    </div>
  )
}

export default HomelessBookSyncInput
