'use client'

import Modal from '@annatarhe/lake-ui/modal'
import FileSaver from 'file-saver'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'

import { APP_URL_ORIGIN } from '@/constants/config'
import { useTranslation } from '@/i18n/client'
import { resolveMediaUrl } from '@/utils/image'

import {
  capturePoster,
  decodeImages,
  posterFilename,
  prepareImage,
} from './share-image'
import SharePoster, { type PosterData } from './share-poster'
import ThemePicker from './theme-picker'
import { Theme } from './theme.config'

function PosterSession({ data: initialData }: { data: PosterData }) {
  // SharePreview remounts this session whenever its serialized content changes.
  const [data] = useState(initialData)
  const { t, i18n } = useTranslation()
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
    Promise.all([decodeImages(poster.current), document.fonts?.ready])
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

  async function save() {
    if (busy.current || !ready || error || !poster.current) return
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
            />
          </div>
        </div>
      </div>
      <aside className="flex min-w-0 flex-1 flex-col gap-5 md:min-w-48">
        <h3 className="text-lg font-bold">{t('app.sharePoster.theme')}</h3>
        <ThemePicker current={theme} onChange={setTheme} disabled={saving} />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('app.sharePoster.hint')}
        </p>
        {!ready && !error && <output>{t('app.common.loading')}</output>}
        {error && (
          <div role="alert" className="text-sm text-red-600 dark:text-red-400">
            <p>{t(`app.sharePoster.${error}`)}</p>
            <button
              type="button"
              className="mt-3 underline"
              onClick={() => {
                setImages({})
                setReady(false)
                setError('')
                setAttempt((value) => value + 1)
              }}
            >
              {t('app.sharePoster.retry')}
            </button>
          </div>
        )}
        <button
          type="button"
          disabled={!ready || saving || !!error}
          aria-busy={saving}
          onClick={save}
          className="rounded-xl bg-indigo-600 px-6 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? t('app.common.loading') : t('app.clipping.save')}
        </button>
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
  return (
    <Modal isOpen={opened} onClose={onCancel} title={t('app.clipping.preview')}>
      {opened && (
        <PosterSession
          key={JSON.stringify([data, i18n.resolvedLanguage])}
          data={data}
        />
      )}
    </Modal>
  )
}
