'use client'

import Button from '@annatarhe/lake-ui/button'
import InputField from '@annatarhe/lake-ui/form-input-field'
import Sheet from '@annatarhe/lake-ui/sheet'
import Spinner from '@annatarhe/lake-ui/spinner'
import { useMutation } from '@apollo/client/react'
import { Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useDeferredValue, useState } from 'react'
import { toast } from 'react-hot-toast'

import { UpdateClippingBookIdDocument } from '@/gql/graphql'
import { useBookSearch } from '@/hooks/book'
import { useTranslation } from '@/i18n/client'
import { cn } from '@/lib/utils'
import type { WenquBook } from '@/services/wenqu'

import BookCover from './book-cover'
import { publishedYear } from './book-meta'

type BookMatchSheetProps = {
  open: boolean
  onClose: () => void
  /** Any clipping carrying the title; the server moves all of them. */
  clippingId: number
  title: string
  onMatched?: (book: WenquBook) => void
}

function BookMatchSheet(props: BookMatchSheetProps) {
  const { open, onClose, clippingId, title, onMatched } = props
  const { t } = useTranslation(undefined, 'library')
  const router = useRouter()
  const [query, setQuery] = useState(title)
  const deferredQuery = useDeferredValue(query.trim())
  const [selected, setSelected] = useState<WenquBook | null>(null)
  const search = useBookSearch(deferredQuery, 0, open)
  const [updateBook, { loading: saving }] = useMutation(
    UpdateClippingBookIdDocument
  )

  const candidates = search.data?.books ?? []
  const searching = search.isFetching

  const onConfirm = async () => {
    if (!selected) return
    try {
      await updateBook({
        variables: { cid: clippingId, doubanId: Number(selected.doubanId) },
      })
      toast.success(t('match.done', { title: selected.title }))
      onMatched?.(selected)
      onClose()
      router.refresh()
    } catch {
      toast.error(t('match.failed'))
    }
  }

  return (
    <Sheet
      isOpen={open}
      onClose={onClose}
      title={t('match.title')}
      width="max-w-lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            {t('match.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            loading={saving}
            disabled={!selected || saving}
          >
            {t('match.confirm')}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-lake-fg-muted text-sm">
          {t('match.description', { title })}
        </p>
        <InputField
          type="search"
          label={t('match.searchLabel')}
          placeholder={t('match.searchPlaceholder')}
          value={query}
          maxLength={64}
          data-autofocus
          onChange={(e) => {
            setQuery(e.target.value)
            setSelected(null)
          }}
        />
        <div aria-live="polite" className="type-meta min-h-5">
          {deferredQuery.length < 2
            ? t('match.hint')
            : searching
              ? null
              : t('match.results', { count: candidates.length })}
        </div>
        {searching ? (
          <div className="flex justify-center py-10">
            <Spinner size="md" />
          </div>
        ) : deferredQuery.length >= 2 && candidates.length === 0 ? (
          <p className="text-lake-fg-subtle py-10 text-center text-sm">
            {t('match.empty')}
          </p>
        ) : (
          <ul className="flex flex-col gap-2" aria-label={t('match.title')}>
            {candidates.map((book) => {
              const isSelected = selected?.id === book.id
              return (
                <li key={book.id}>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelected(isSelected ? null : book)}
                    className={cn(
                      'rounded-lake-control flex w-full items-start gap-3 border p-3 text-left transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-lake-ring',
                      isSelected
                        ? 'border-lake-accent bg-lake-accent-soft'
                        : 'border-lake-line hover:border-lake-line-strong hover:bg-lake-surface-muted/60'
                    )}
                  >
                    <BookCover
                      book={book}
                      title={book.title}
                      className="w-12 shrink-0"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="font-reading text-lake-fg block truncate font-semibold">
                        {book.title}
                      </span>
                      <span className="text-lake-fg-muted block truncate text-sm">
                        {[book.author, book.press, publishedYear(book.pubdate)]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </span>
                    {isSelected ? (
                      <Check
                        className="text-lake-accent-text size-5 shrink-0"
                        aria-hidden="true"
                      />
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Sheet>
  )
}

export default BookMatchSheet
