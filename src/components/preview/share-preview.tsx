'use client'

import '@fontsource/literata/400.css'
import '@fontsource/literata/400-italic.css'
import '@fontsource/literata/700.css'
import 'lxgw-wenkai-webfont/lxgwwenkai-regular.css'
import 'lxgw-wenkai-webfont/lxgwwenkai-bold.css'
import Button from '@annatarhe/lake-ui/button'
import TextareaField from '@annatarhe/lake-ui/form-textarea-field'
import Modal from '@annatarhe/lake-ui/modal'
import Skeleton from '@annatarhe/lake-ui/skeleton'
import FileSaver from 'file-saver'
import { Download, Shuffle } from 'lucide-react'
import { type ReactNode, useEffect, useId, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'

import { APP_URL_ORIGIN } from '@/constants/config'
import { useTranslation } from '@/i18n/client'
import { cn } from '@/lib/utils'
import { resolveMediaUrl } from '@/utils/image'

import { NOTE_MAX_LENGTH } from './poster-text'
import {
  capturePoster,
  decodeImages,
  loadPosterFonts,
  posterFilename,
  prepareImage,
} from './share-image'
import SharePoster, { type PosterData } from './share-poster'
import ThemePicker from './theme-picker'
import { Theme } from './theme.config'
import { useBookHighlights } from './use-book-highlights'

function PanelSection({
  title,
  titleId,
  action,
  children,
}: {
  title: string
  titleId?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex min-h-8 items-center justify-between gap-3">
        <h3 id={titleId} className="type-eyebrow">
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  )
}

function PosterSession({
  data: initialData,
  note,
  onNoteChange,
}: {
  data: PosterData
  note: string
  onNoteChange: (note: string) => void
}) {
  // SharePreview remounts this session whenever its serialized content changes.
  const [data] = useState(initialData)
  const { t, i18n } = useTranslation()
  const noteId = useId()
  const highlights = useBookHighlights({
    bookId: data.book.doubanId,
    uid: data.uid,
    total: data.clippingsCount ?? 0,
    enabled: !data.clipping,
  })
  const [theme, setTheme] = useState(Theme.young)
  const [images, setImages] = useState<Record<string, string>>({})
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [saving, setSaving] = useState(false)
  const [size, setSize] = useState({ scale: 1, height: 600 })
  const poster = useRef<HTMLDivElement>(null)
  const viewport = useRef<HTMLDivElement>(null)
  const active = useRef(true)
  const busy = useRef(false)

  useEffect(() => {
    active.current = true
    return () => {
      active.current = false
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 20_000)
    let cancelled = false
    const sources = data.clipping
      ? { avatar: resolveMediaUrl(data.clipping.creator.avatar) }
      : { cover: resolveMediaUrl(data.book.image) }
    Promise.all(
      Object.entries(sources)
        .filter(([, url]) => url)
        .map(
          async ([key, url]) =>
            [
              key,
              await prepareImage(url, controller.signal, attempt > 0),
            ] as const
        )
    )
      .then((entries) => {
        if (!cancelled) setImages(Object.fromEntries(entries))
      })
      .catch(() => {
        if (!cancelled) setError('assetsError')
      })
      .finally(() => clearTimeout(timer))
    return () => {
      cancelled = true
      clearTimeout(timer)
      controller.abort()
    }
  }, [data, attempt])

  useEffect(() => {
    let cancelled = false
    if (!poster.current) return
    const required = data.clipping
      ? data.clipping.creator.avatar
      : data.book.image
    if (required && !Object.keys(images).length) return
    Promise.all([decodeImages(poster.current), loadPosterFonts(poster.current)])
      .then(() => {
        if (!cancelled) setReady(true)
      })
      .catch(() => {
        if (!cancelled) setError('assetsError')
      })
    return () => {
      cancelled = true
    }
  }, [images, data])

  useEffect(() => {
    const resize = () => {
      if (!viewport.current || !poster.current) return
      setSize({
        scale: Math.min(1, viewport.current.clientWidth / 375),
        height: poster.current.offsetHeight,
      })
    }
    const observer = new ResizeObserver(resize)
    if (viewport.current) observer.observe(viewport.current)
    if (poster.current) observer.observe(poster.current)
    resize()
    return () => observer.disconnect()
  }, [])

  const canSave = ready && !error && highlights.status !== 'loading'

  async function save() {
    if (busy.current || !canSave || !poster.current) return
    busy.current = true
    setSaving(true)
    setError('')
    try {
      const blob = await capturePoster(poster.current)
      if (!active.current) return
      FileSaver.saveAs(
        blob,
        posterFilename(
          data.book.title,
          data.book.author,
          data.clipping?.id ?? 'share'
        )
      )
      toast.success(t('app.sharePoster.success'))
    } catch (cause) {
      if (active.current)
        setError(
          cause instanceof Error && cause.message === 'poster-too-large'
            ? 'tooLarge'
            : 'exportError'
        )
    } finally {
      busy.current = false
      if (active.current) setSaving(false)
    }
  }

  return (
    <section
      style={{ maxHeight: 'calc(100dvh - 12rem)' }}
      className="flex flex-col gap-6 overflow-y-auto p-2 md:flex-row"
    >
      <div ref={viewport} className="w-full min-w-0 md:w-[375px] md:shrink-0">
        <div style={{ height: size.height * size.scale, position: 'relative' }}>
          <div
            style={{
              transform: `scale(${size.scale})`,
              transformOrigin: 'top left',
              width: 375,
            }}
          >
            <SharePoster
              ref={poster}
              data={data}
              theme={theme}
              images={images}
              origin={APP_URL_ORIGIN}
              locale={
                i18n.resolvedLanguage === 'zhCN'
                  ? 'zh-CN'
                  : i18n.resolvedLanguage || 'en'
              }
              label={t(
                data.clipping
                  ? 'app.sharePoster.clippingLabel'
                  : 'app.sharePoster.bookLabel'
              )}
              note={note}
              noteLabel={t('app.sharePoster.noteLabel')}
              highlights={highlights.highlights}
              highlightsLabel={t('app.sharePoster.highlightsLabel')}
            />
          </div>
        </div>
      </div>
      {/* Sticky so Save stays in reach while a tall poster scrolls. */}
      <aside className="flex min-w-0 flex-1 flex-col gap-7 md:sticky md:top-0 md:min-w-48 md:self-start">
        <PanelSection title={t('app.sharePoster.theme')}>
          <ThemePicker current={theme} onChange={setTheme} disabled={saving} />
        </PanelSection>

        {data.clipping ? null : (
          <PanelSection
            title={t('app.sharePoster.highlights')}
            action={
              highlights.status === 'ready' && highlights.canShuffle ? (
                <Button
                  variant="ghost"
                  size="sm"
                  leadingIcon={<Shuffle className="size-4" />}
                  onClick={highlights.shuffle}
                  disabled={saving}
                >
                  {t('app.sharePoster.shuffle')}
                </Button>
              ) : null
            }
          >
            {highlights.status === 'loading' ? (
              <Skeleton shape="text" lines={2} />
            ) : highlights.status === 'error' ? (
              <div
                role="alert"
                className="text-lake-danger flex flex-wrap items-center gap-x-3 gap-y-1 text-sm"
              >
                <span>{t('app.sharePoster.highlightsError')}</span>
                <Button variant="ghost" size="sm" onClick={highlights.retry}>
                  {t('app.sharePoster.retry')}
                </Button>
              </div>
            ) : (
              <p className="type-meta">
                {t(
                  highlights.highlights.length
                    ? 'app.sharePoster.highlightsHint'
                    : 'app.sharePoster.highlightsEmpty'
                )}
              </p>
            )}
          </PanelSection>
        )}

        <PanelSection title={t('app.sharePoster.noteTitle')} titleId={noteId}>
          <TextareaField
            aria-labelledby={noteId}
            aria-describedby={`${noteId}-hint`}
            rows={4}
            maxLength={NOTE_MAX_LENGTH}
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            disabled={saving}
            placeholder={t(
              data.clipping
                ? 'app.sharePoster.notePlaceholderClipping'
                : 'app.sharePoster.notePlaceholderBook'
            )}
            className="font-reading leading-relaxed"
          />
          <div
            id={`${noteId}-hint`}
            className="type-meta flex items-baseline justify-between gap-3"
          >
            <span>{t('app.sharePoster.noteHint')}</span>
            <span
              className={cn(
                'tabular-nums transition-colors duration-150',
                note.length >= NOTE_MAX_LENGTH - 20 && 'text-lake-warning'
              )}
            >
              {note.length}/{NOTE_MAX_LENGTH}
            </span>
          </div>
        </PanelSection>

        <div className="border-lake-line flex flex-col gap-3 border-t pt-5">
          {error ? (
            <div
              role="alert"
              className="text-lake-danger flex flex-wrap items-center gap-x-3 gap-y-1 text-sm"
            >
              <p>{t(`app.sharePoster.${error}`)}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setImages({})
                  setReady(false)
                  setError('')
                  setAttempt((value) => value + 1)
                }}
              >
                {t('app.sharePoster.retry')}
              </Button>
            </div>
          ) : null}
          <Button
            variant="primary"
            fullWidth
            leadingIcon={<Download className="size-4" />}
            disabled={!canSave}
            loading={saving}
            onClick={save}
          >
            {t('app.clipping.save')}
          </Button>
          {!ready && !error ? (
            <output className="type-meta">{t('app.common.loading')}</output>
          ) : (
            <p className="type-meta">{t('app.sharePoster.hint')}</p>
          )}
        </div>
      </aside>
    </section>
  )
}

export default function SharePreview({
  opened,
  onCancel,
  data,
}: {
  opened: boolean
  onCancel: () => void
  data: PosterData
}) {
  const { t, i18n } = useTranslation()
  // Lives outside the session so a draft survives closing the modal and is
  // not part of the session key: typing never remounts the poster.
  const [note, setNote] = useState('')
  return (
    <Modal isOpen={opened} onClose={onCancel} title={t('app.clipping.preview')}>
      {opened && (
        <PosterSession
          key={JSON.stringify([data, i18n.resolvedLanguage])}
          data={data}
          note={note}
          onNoteChange={setNote}
        />
      )}
    </Modal>
  )
}
