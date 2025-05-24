import Modal from '@annatarhe/lake-ui/modal'
import { useApolloClient } from '@apollo/client'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useBookSearch } from '../../hooks/book'
import { useUpdateClippingBookIdMutation } from '../../schema/generated'
import { WenquBook } from '../../services/wenqu'
import BookCandidate from './bookCandidate'

import Button from '../button'
import LoadingIcon from '../icons/loading.svg'
import Empty from './empty'

type BookInfoChangerProps = {
  clippingID: number
  bookName?: string
  visible: boolean
  onClose: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onConfirm: (bookDoubanId: string) => Promise<any>
}

function BookInfoChanger(props: BookInfoChangerProps) {
  const { t } = useTranslation()
  const [bookName, setBookName] = useState('')
  const [selectedBook, setSelectedBook] = useState<WenquBook | null>(null)
  const candidates = useBookSearch(bookName, 0, props.visible)
  const client = useApolloClient()
  const [doUpdate, { loading }] = useUpdateClippingBookIdMutation()

  // set inital value
  useEffect(() => {
    if (!props.bookName) {
      return
    }
    setBookName(props.bookName)
  }, [props.bookName])

  const onSubmit = useCallback(async () => {
    if (!selectedBook) {
      return
    }

    // return toast.promise(new Promise(r => setTimeout(r, 4000)), {
    return toast.promise(
      doUpdate({
        variables: {
          cid: props.clippingID,
          doubanId: selectedBook.doubanId,
        },
      }),
      {
        loading: t('app.common.saving'),
        success: () => {
          client.resetStore()
          setBookName('')
          props.onClose()
          return t('app.common.done')
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error: (err: any) => t(err),
      }
    )
  }, [selectedBook?.id, props.clippingID])

  return (
    <Modal
      onClose={() => {
        setBookName('')
        props.onClose()
      }}
      isOpen={props.visible}
      title={t('app.clipping.update')}
    >
      <div>
        <input
          // leftSection={<MagnifyingGlassIcon className="ml-2 h-4 w-4" />}
          type="search"
          max={64}
          value={bookName}
          onChange={(e) => setBookName(e.target.value)}
          placeholder={t('app.clipping.updatePlaceholder') ?? ''}
        />
      </div>
      <div>
        <p className="bg-linear-to-br p-2">
          {t('app.clipping.updateCandidatesCount', {
            count: candidates.data?.count ?? 0,
          })}
        </p>
        <p className="mt-2 bg-linear-to-br p-2">
          {t('app.clipping.updateSelectedTip', {
            title: selectedBook?.title ?? 'null',
          })}
        </p>
        <ul
          className="overflow-y-auto"
          style={{
            maxHeight: '65vh',
          }}
        >
          {candidates.isFetching && (
            <div className="flex h-96 w-full items-center justify-center">
              <LoadingIcon className="animate-spin" />
            </div>
          )}
          {candidates.isFetched &&
            !candidates.isLoading &&
            candidates.data?.count === 0 && <Empty />}
          {candidates.data?.books.map((x) => (
            <BookCandidate
              key={x.id}
              book={x}
              selected={x.id === selectedBook?.id}
              onSelecte={(b) => {
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
        <Button
          variant="primary"
          fullWidth
          onClick={onSubmit}
          size="lg"
          isLoading={loading}
          className="mt-8 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 before:from-indigo-500 before:to-cyan-500"
          disabled={!selectedBook}
        >
          {t('app.common.doUpdate')}
        </Button>
      </div>
    </Modal>
  )
}

export default BookInfoChanger
