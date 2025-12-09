import InputField from '@annatarhe/lake-ui/form-input-field'
import Modal from '@annatarhe/lake-ui/modal'
import { useApolloClient } from '@apollo/client'
import { useCallback, useState } from 'react'
import { toast } from 'react-hot-toast'
import Button from '@/components/button/button'
import LoadingIcon from '@/components/icons/loading.svg'
import { useBookSearch } from '@/hooks/book'
import { useTranslation } from '@/i18n/client'
import { useUpdateClippingBookIdMutation } from '@/schema/generated'
import type { WenquBook } from '@/services/wenqu'
import BookCandidate from './bookCandidate'
import Empty from './empty'

type BookInfoChangerProps = {
  clippingID: number
  bookName?: string
  visible: boolean
  onClose: () => void
  onConfirm: (bookDoubanId: string) => Promise<void>
}

// Inner component that handles the actual form logic
function BookInfoChangerContent(props: BookInfoChangerProps) {
  const { t } = useTranslation(undefined, 'book')
  // Initialize state from props
  const [bookNameInput, setBookNameInput] = useState(props.bookName ?? '')
  const [selectedBook, setSelectedBook] = useState<WenquBook | null>(null)
  const candidates = useBookSearch(bookNameInput, 0, props.visible)
  const client = useApolloClient()
  const [doUpdate, { loading: isUpdating }] = useUpdateClippingBookIdMutation()

  const handleSubmit = useCallback(async () => {
    if (!selectedBook) {
      return
    }

    toast.promise(
      doUpdate({
        variables: {
          cid: props.clippingID,
          doubanId: selectedBook.doubanId,
        },
      }),
      {
        loading: t('app.book.changeInfoModal.savingToast'),
        success: () => {
          client.resetStore()
          props.onClose()
          return t('app.book.changeInfoModal.doneToast')
        },
        error: (err: Error) => t(err.message || 'An unexpected error occurred'),
      }
    )
  }, [selectedBook, props.clippingID, doUpdate, t, client, props.onClose])

  const handleCloseModal = () => {
    props.onClose()
  }

  const isLoadingCandidates = candidates.isFetching || candidates.isLoading
  const candidateBooks = candidates.data?.books ?? []

  return (
    <Modal
      onClose={handleCloseModal}
      isOpen={props.visible}
      title={t('app.book.changeInfoModal.title')}
    >
      <div className='flex h-[75vh] flex-col sm:h-[70vh]'>
        <div className='border-b border-gray-200 p-4 dark:border-gray-700'>
          <InputField
            // leftSection={<Search className="ml-2 h-4 w-4 text-gray-400" />}
            type='search'
            maxLength={64}
            value={bookNameInput}
            onChange={(e) => setBookNameInput(e.target.value)}
            placeholder={t('app.book.changeInfoModal.searchPlaceholder') ?? ''}
            className='w-full'
          />
          <div className='mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400'>
            <span>
              {t('app.book.changeInfoModal.candidatesCount', {
                count: candidates.data?.count ?? 0,
              })}
            </span>
            {selectedBook && (
              <span className='truncate'>
                {t('app.book.changeInfoModal.selectedTip', {
                  title: selectedBook.title,
                })}
              </span>
            )}
          </div>
        </div>

        <div className='flex-grow overflow-y-auto p-4'>
          {isLoadingCandidates && (
            <div className='flex h-full min-h-[200px] w-full flex-col items-center justify-center text-gray-500 dark:text-gray-400'>
              <LoadingIcon className='text-primary h-8 w-8 animate-spin' />
              <p className='mt-2 text-sm'>{t('common.loading')}</p>
            </div>
          )}
          {!isLoadingCandidates && candidateBooks.length === 0 && (
            <div className='flex h-full min-h-[200px] w-full items-center justify-center'>
              <Empty />
            </div>
          )}
          {!isLoadingCandidates && candidateBooks.length > 0 && (
            <ul className='space-y-3'>
              {candidateBooks.map((book) => (
                <BookCandidate
                  key={book.id}
                  book={book}
                  selected={book.id === selectedBook?.id}
                  onSelecte={(b) => {
                    setSelectedBook((prev) => (prev?.id === b.id ? null : b))
                  }}
                />
              ))}
            </ul>
          )}
        </div>

        <div className='border-t border-gray-200 p-4 dark:border-gray-700'>
          <Button
            variant='primary'
            fullWidth
            onClick={handleSubmit}
            size='lg'
            isLoading={isUpdating}
            disabled={!selectedBook || isUpdating}
          >
            {t('app.book.changeInfoModal.submitButton')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// Wrapper component that resets state via key when modal becomes visible
function BookInfoChanger(props: BookInfoChangerProps) {
  // Use a key that changes when modal opens to reset internal state
  const key = props.visible ? `open-${props.clippingID}` : 'closed'
  return <BookInfoChangerContent key={key} {...props} />
}

export default BookInfoChanger
