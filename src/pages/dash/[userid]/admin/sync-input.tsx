import React, { useState, useCallback } from 'react'
import { useMutation, useApolloClient } from '@apollo/client'
import syncHomelessBook from '../../../../schema/mutations/sync-homeless-books.graphql'
import swal from 'sweetalert'

type HomelessBookSyncInputProps = {
  bookName: string
}

function HomelessBookSyncInput(props: HomelessBookSyncInputProps) {
  const client = useApolloClient()
  const [doubanId, setDoubanId] = useState('')
  const onConfirm = useCallback(() => {
    client.mutate({
      mutation: syncHomelessBook,
      variables: {
        title: props.bookName,
        doubanID: doubanId
      }
    }).then(res => {
      client.resetStore()
      swal({
        icon: 'success',
        title: 'updated'
      })
    }).catch(err => {
      swal({
        icon: 'error',
        title: 'error'
      })
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
