import { useApolloClient } from '@apollo/client'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBookSearch } from '../../hooks/book'
import { WenquBook } from '../../services/wenqu'
import BookCandidate from './bookCandidate'
import { toast } from 'react-hot-toast'
import { useUpdateClippingBookIdMutation } from '../../schema/generated'
import { Button, Input, Modal } from '@mantine/core'
import LoadingIcon from '../icons/loading.svg'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

type BookInfoChangerProps = {
  clippingID: number
  bookName?: string
  visible: boolean
  onClose: () => void
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
      return toast.promise(doUpdate({
        variables: {
          cid: props.clippingID,
          doubanId: selectedBook.doubanId
        }
      }), {
      loading: t('app.common.saving'),
      success: () => {
        client.resetStore()
        setBookName('')
        props.onClose()
        return t('app.common.done')
      },
      error: (err) => t(err),
    })
  }, [selectedBook?.id, props.clippingID])

  return (
    <Modal
      centered
      onClose={() => {
        setBookName('')
        props.onClose()
      }}
      opened={props.visible}
      size='xl'
      title={t('app.clipping.update')}
      overlayProps={{
        blur: 16,
        opacity: 0.7,
      }}
    >
      <Modal.Body>
        <div>
          <Input
            leftSection={<MagnifyingGlassIcon className='w-4 h-4 ml-2' />}
            type='search'
            max={64}
            value={bookName}
            onChange={e => setBookName(e.target.value)}
            size='xl'
            placeholder={t('app.clipping.updatePlaceholder') ?? ''}
          />
        </div>
        <div>
          <p
            className='bg-gradient-to-br p-2'
          >{t('app.clipping.updateCandidatesCount', {
            count: candidates.data?.count ?? 0
          })}</p>
          <p
            className='bg-gradient-to-br p-2 mt-2'
          >{t('app.clipping.updateSelectedTip', {
            title: selectedBook?.title ?? 'null'
          })}</p>
          <ul
            className='overflow-y-auto'
            style={{
              maxHeight: '65vh'
            }}
          >
            {candidates.isFetching && (
              <div className='w-full flex justify-center items-center h-96'>
                <LoadingIcon className=' animate-spin' />
              </div>
            )}
            {candidates.isFetched && !candidates.isLoading && candidates.data?.count === 0 && (
              <div className='w-full flex justify-center items-center h-96 flex-col'>
                <span className=' text-9xl'>🤨</span>
                <p className='mt-2'>{t('app.menu.search.empty')}</p>
              </div>
            )}
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
          <Button
            variant='gradient'
            gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
            fullWidth
            onClick={onSubmit}
            mt={8}
            size='lg'
            loading={loading}
            className='active:scale-95 transition-all duration-75'
            disabled={!selectedBook}
          >
            {t('app.common.doUpdate')}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default BookInfoChanger
