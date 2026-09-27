'use client'

import Button from '@annatarhe/lake-ui/button'
import InputField from '@annatarhe/lake-ui/form-input-field'
import IconButton from '@annatarhe/lake-ui/icon-button'
import Spinner from '@annatarhe/lake-ui/spinner'
import download from 'downloadjs'
import { toPng } from 'html-to-image'
import { Check, Download, Plus, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'react-hot-toast'

import BookCover from '@/components/book/book-cover'
import { useBookSearch } from '@/hooks/book'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useTranslation } from '@/i18n/client'
import { cn } from '@/lib/utils'
import type { WenquBook } from '@/services/wenqu'

import { MAX_BOOKS, MIN_BOOKS } from './limits'

const RESULT_LIMIT = 12
const EXPORT_IGNORE = 'data-export-ignore'

// Book titles go through React, which escapes them already.
const raw = { interpolation: { escapeValue: false } } as const

/** Controls on the card (remove buttons) stay out of the saved image. */
function keepInExport(node: HTMLElement) {
  return !(node instanceof Element && node.hasAttribute(EXPORT_IGNORE))
}

function FavouritesBuilder() {
  const { t } = useTranslation(undefined, 'report')
  const [title, setTitle] = useState('')
  const [query, setQuery] = useState('')
  const [picks, setPicks] = useState<WenquBook[]>([])
  const [exporting, setExporting] = useState(false)
  const cardRef = useRef<HTMLElement>(null)

  const searchText = useDebouncedValue(query.trim(), 300)
  const search = useBookSearch(searchText, 0)
  const results = (search.data?.books ?? []).slice(0, RESULT_LIMIT)

  const pickedIds = new Set(picks.map((b) => b.id))
  const full = picks.length >= MAX_BOOKS
  const ready = picks.length >= MIN_BOOKS
  const cardTitle = title.trim() || t('favourites.titleField.default')

  const toggle = (book: WenquBook) => {
    setPicks((current) => {
      if (current.some((b) => b.id === book.id))
        return current.filter((b) => b.id !== book.id)
      if (current.length >= MAX_BOOKS) return current
      return [...current, book]
    })
  }

  const remove = (id: number) =>
    setPicks((current) => current.filter((b) => b.id !== id))

  const save = async () => {
    const node = cardRef.current
    if (!node || !ready) return
    setExporting(true)
    try {
      const image = await toPng(node, {
        pixelRatio: 2,
        cacheBust: true,
        filter: keepInExport,
        backgroundColor: getComputedStyle(node).backgroundColor,
      })
      download(image, 'clippingkk-favourites.png', 'image/png')
      toast.success(t('favourites.export.done'))
    } catch (error) {
      console.error('favourites: export failed', error)
      toast.error(t('favourites.export.failed'))
    } finally {
      setExporting(false)
    }
  }

  let searchStatus: string | null = null
  if (searchText.length < 2) searchStatus = t('favourites.search.hint')
  else if (search.isLoading) searchStatus = t('favourites.search.loading')
  else if (results.length === 0)
    searchStatus = t('favourites.search.empty', { query: searchText, ...raw })

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-14">
      <div className="flex flex-col gap-6">
        <InputField
          label={t('favourites.titleField.label')}
          placeholder={t('favourites.titleField.default')}
          value={title}
          maxLength={60}
          onChange={(e) => setTitle(e.target.value)}
        />
        <InputField
          type="search"
          label={t('favourites.search.label')}
          placeholder={t('favourites.search.placeholder')}
          value={query}
          autoComplete="off"
          onChange={(e) => setQuery(e.target.value)}
        />

        <section aria-label={t('favourites.search.results')}>
          {searchStatus ? (
            <p
              aria-live="polite"
              className="type-meta flex items-center gap-2 py-2"
            >
              {search.isLoading && searchText.length >= 2 ? (
                <Spinner size="xs" />
              ) : null}
              {searchStatus}
            </p>
          ) : (
            <ul className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((book) => {
                const picked = pickedIds.has(book.id)
                const disabled = full && !picked
                return (
                  <li key={book.id}>
                    <button
                      type="button"
                      onClick={() => toggle(book)}
                      disabled={disabled}
                      aria-pressed={picked}
                      aria-label={
                        picked
                          ? t('favourites.pick.remove', {
                              title: book.title,
                              ...raw,
                            })
                          : t('favourites.pick.add', {
                              title: book.title,
                              ...raw,
                            })
                      }
                      className="group rounded-lake-control focus-visible:ring-lake-ring focus-visible:ring-offset-lake-canvas flex w-full flex-col gap-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="relative block">
                        <BookCover
                          book={book}
                          title={book.title}
                          author={book.author}
                          className={cn(
                            'transition-opacity duration-150',
                            picked && 'opacity-60'
                          )}
                        />
                        <span
                          aria-hidden="true"
                          className={cn(
                            'absolute right-1.5 bottom-1.5 flex size-7 items-center justify-center rounded-full border transition-colors duration-150',
                            picked
                              ? 'border-lake-accent bg-lake-accent text-lake-accent-fg'
                              : 'border-lake-line bg-lake-surface text-lake-fg-muted group-hover:text-lake-fg'
                          )}
                        >
                          {picked ? (
                            <Check className="size-4" />
                          ) : (
                            <Plus className="size-4" />
                          )}
                        </span>
                      </span>
                      <span className="text-lake-fg line-clamp-2 text-sm leading-snug">
                        {book.title}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      <div className="flex flex-col gap-4 lg:sticky lg:top-20">
        <section
          ref={cardRef}
          aria-label={t('favourites.card.label')}
          className="rounded-lake-panel border-lake-line bg-lake-surface shadow-lake-card flex flex-col gap-6 border p-6 sm:p-8"
        >
          <h2 className="type-title text-lake-fg">{cardTitle}</h2>
          {picks.length > 0 ? (
            <ol
              className={cn(
                'grid gap-4',
                picks.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'
              )}
            >
              {picks.map((book) => (
                <li key={book.id} className="relative">
                  <BookCover
                    book={book}
                    title={book.title}
                    author={book.author}
                  />
                  <span
                    {...{ [EXPORT_IGNORE]: '' }}
                    className="absolute top-1.5 right-1.5"
                  >
                    <IconButton
                      size="sm"
                      variant="secondary"
                      label={t('favourites.pick.remove', {
                        title: book.title,
                        ...raw,
                      })}
                      icon={<X className="size-3.5" />}
                      onClick={() => remove(book.id)}
                    />
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="rounded-lake-control border-lake-line text-lake-fg-subtle flex aspect-[3/2] items-center justify-center border border-dashed p-6 text-center text-sm">
              {t('favourites.card.empty')}
            </p>
          )}
          <p className="border-lake-line type-meta flex items-center justify-between gap-4 border-t pt-4">
            <span className="font-reading">{t('favourites.card.footer')}</span>
            <span>clippingkk.annatarhe.com</span>
          </p>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p aria-live="polite" className="type-meta">
            {[
              t('favourites.count', { count: picks.length, max: MAX_BOOKS }),
              full ? t('favourites.full') : null,
              ready ? null : t('favourites.needMore', { min: MIN_BOOKS }),
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <div className="flex items-center gap-2">
            {picks.length > 0 ? (
              <Button variant="ghost" size="sm" onClick={() => setPicks([])}>
                {t('favourites.clear')}
              </Button>
            ) : null}
            <Button
              variant="primary"
              size="sm"
              onClick={save}
              disabled={!ready || exporting}
              loading={exporting}
              leadingIcon={<Download className="size-4" />}
            >
              {exporting
                ? t('favourites.export.busy')
                : t('favourites.export.action')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FavouritesBuilder
