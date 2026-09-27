'use client'

import Button from '@annatarhe/lake-ui/button'
import Sheet from '@annatarhe/lake-ui/sheet'
import Spinner from '@annatarhe/lake-ui/spinner'
import { CircleAlert, CircleCheck, FileText } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import VisibilityChoice, {
  type ImportVisibility,
  toVisibleFlag,
} from '@/components/import/visibility-choice'
import { useClippingsImport } from '@/hooks/use-clippings-import'
import { useTranslation } from '@/i18n/client'
import { isTextFile, isUploadRoute, UploadStep } from '@/services/uploader'

import DropOverlay from './drop-overlay'

function hasFiles(e: DragEvent) {
  return Array.from(e.dataTransfer?.types ?? []).includes('Files')
}

type GlobalUploadProps = {
  libraryHref: Route
}

/**
 * Drop My Clippings.txt anywhere in the app. It never uploads silently: a
 * sheet asks for the visibility first, then progress shows in a corner.
 */
function GlobalUpload({ libraryHref }: GlobalUploadProps) {
  const { t } = useTranslation(undefined, 'import')
  const pathname = usePathname()
  const disabled = isUploadRoute(pathname)
  const { step, at, count, result, start, reset } = useClippingsImport()
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [visibility, setVisibility] = useState<ImportVisibility>('public')

  const onDragOver = useCallback((e: DragEvent) => {
    if (!hasFiles(e)) return
    e.preventDefault()
    setDragging(true)
  }, [])

  const onDrop = useCallback((e: DragEvent) => {
    if (!hasFiles(e)) return
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer?.files?.[0]
    if (dropped && isTextFile(dropped)) {
      setVisibility('public')
      setFile(dropped)
    }
  }, [])

  useEffect(() => {
    if (disabled) return
    document.body.addEventListener('dragover', onDragOver)
    document.body.addEventListener('drop', onDrop)
    return () => {
      document.body.removeEventListener('dragover', onDragOver)
      document.body.removeEventListener('drop', onDrop)
    }
  }, [disabled, onDragOver, onDrop])

  const running =
    step !== UploadStep.None &&
    step !== UploadStep.Done &&
    step !== UploadStep.Error

  const onStart = () => {
    if (!file) return
    void start(file, { visible: toVisibleFlag(visibility) })
    setFile(null)
  }

  return (
    <>
      {dragging && !disabled ? (
        <DropOverlay
          label={t('global.overlay')}
          onClose={() => setDragging(false)}
        />
      ) : null}
      <Sheet
        isOpen={!!file}
        onClose={() => setFile(null)}
        title={t('global.title')}
        width="max-w-md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setFile(null)}>
              {t('global.cancel')}
            </Button>
            <Button variant="primary" onClick={onStart}>
              {t('global.start')}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          <p className="text-lake-fg-muted flex items-center gap-2 text-sm">
            <FileText className="size-4 shrink-0" aria-hidden="true" />
            {t('global.description', { name: file?.name ?? '' })}
          </p>
          <VisibilityChoice value={visibility} onChange={setVisibility} />
        </div>
      </Sheet>
      {step !== UploadStep.None ? (
        <output
          data-ui-scale="standard"
          className="rounded-lake-panel border-lake-line bg-lake-surface-raised shadow-lake-overlay animate-in fade-in slide-in-from-bottom-4 fixed right-4 bottom-20 z-40 flex items-center gap-3 border px-4 py-3 text-sm md:bottom-6"
        >
          {running ? (
            <>
              <Spinner size="sm" />
              <span className="text-lake-fg">
                {t('global.running')}
                {count > 0 ? ` ${at}/${count}` : ''}
              </span>
            </>
          ) : step === UploadStep.Done ? (
            <>
              <CircleCheck
                className="text-lake-success size-4"
                aria-hidden="true"
              />
              <span className="text-lake-fg">
                {result && result.imported > 0
                  ? t('done.title', { count: result.imported })
                  : t('done.nothingNew')}
              </span>
              <Link
                href={libraryHref}
                onClick={reset}
                className="text-lake-accent-text font-medium hover:underline"
              >
                {t('global.view')}
              </Link>
              <button
                type="button"
                onClick={reset}
                className="text-lake-fg-subtle hover:text-lake-fg"
              >
                {t('global.cancel')}
              </button>
            </>
          ) : (
            <>
              <CircleAlert
                className="text-lake-danger size-4"
                aria-hidden="true"
              />
              <span className="text-lake-fg">{t('global.failed')}</span>
              <button
                type="button"
                onClick={reset}
                className="text-lake-fg-subtle hover:text-lake-fg"
              >
                {t('global.cancel')}
              </button>
            </>
          )}
        </output>
      ) : null}
    </>
  )
}

export default GlobalUpload
