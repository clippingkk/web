import { useApolloClient } from '@apollo/client'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBookSearch } from '../../hooks/book'
import { WenquBook } from '../../services/wenqu'
import Dialog from '../dialog/dialog'
import BookCandidate from './bookCandidate'
import { toast } from 'react-hot-toast'
import { useUpdateClippingBookIdMutation } from '../../schema/generated'

type BookInfoChangerProps = {
  clippingID: number
  visible: boolean
  onClose: () => void
  onConfirm: (bookDoubanId: string) => Promise<any>
}

function BookInfoChanger(props: BookInfoChangerProps) {
  const { t } = useTranslation()
  const [bookName, setBookName] = useState('')
  const [selectedBook, setSelectedBook] = useState<WenquBook | null>(null)
  const candidates = useBookSearch(bookName, 0)
  const client = useApolloClient()
  const [ doUpdate ] = useUpdateClippingBookIdMutation()

  const onSubmit = useCallback(() => {
    if (!selectedBook) {
      return
    }

    return doUpdate({
      variables: {
        cid: props.clippingID,
        doubanId: selectedBook.doubanId
      }
    }).then(() => {
      client.resetStore()
      toast.success(t('app.common.done'))
      setBookName('')
      props.onClose()
    }).catch(err => {
      toast.error(err)
    })
  }, [selectedBook?.id, props.clippingID])

  if (!props.visible) {
    return null
  }

  return (
    <Dialog
      onCancel={() => {
        setBookName('')
        props.onClose()
      }}
      onOk={() => { }}
      title={t('app.clipping.update')}
    >
      <div>
        <div>
          <input
            type='search'
            max={64}
            value={bookName}
            onChange={e => setBookName(e.target.value)}
            className='w-full px-2 py-4 rounded dark:bg-gray-200 text-lg my-2 mx-auto'
            placeholder={t('app.clipping.updatePlaceholder')}
          />
        </div>

        <div>
          <p
            className='bg-gradient-to-br from-orange-600 to-orange-800 rounded p-2'
          >{t('app.clipping.updateCandidatesCount', {
            count: candidates.data?.count ?? 0
          })}</p>
          <p
            className='bg-gradient-to-br from-teal-600 to-teal-800 rounded p-2 mt-2'
          >{t('app.clipping.updateSelectedTip', {
            title: selectedBook?.title ?? 'null'
          })}</p>
          <ul
            className=' overflow-y-auto'
            style={{
              maxHeight: '70vh'
            }}
          >
            {candidates.data?.books.map(x => (
              <BookCandidate
                key={x.id}
                book={x}
                selected={x.id === selectedBook?.id}
                onSelecte={b => {
                  if (selectedBook && selectedBook.id === b.id) {
                    setSelectedBook(null)
                  } else {
                    setSelectedBook(b)
                  }
                }}
              />
            ))}
          </ul>
        </div>

        <div>
          <button
            className='text-white text-2xl w-full from-indigo-400 to-teal-600 bg-gradient-to-br block text-center py-4 mt-4 rounded shadow disabled:from-gray-200 disabled:to-gray-300'
            disabled={!selectedBook}
            onClick={onSubmit}
          >
            ok
          </button>
        </div>
      </div>
    </Dialog>
  )
}

export default BookInfoChanger
