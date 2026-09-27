'use client'

import Button from '@annatarhe/lake-ui/button'
import { FileText, Upload } from 'lucide-react'
import type { Route } from 'next'
import type React from 'react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

import ImportProgress from '@/components/import/import-progress'
import VisibilityChoice, {
  type ImportVisibility,
  toVisibleFlag,
} from '@/components/import/visibility-choice'
import Section from '@/components/layout/section'
import { useClippingsImport } from '@/hooks/use-clippings-import'
import { useTranslation } from '@/i18n/client'
import { cn } from '@/lib/utils'
import { isTextFile, UploadStep } from '@/services/uploader'

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

type ImportPanelProps = {
  libraryHref: Route
}

function ImportPanel({ libraryHref }: ImportPanelProps) {
  const { t } = useTranslation(undefined, 'import')
  const { step, at, count, errors, result, failedStep, start, reset } =
    useClippingsImport()
  const [file, setFile] = useState<File | null>(null)
  // Public is the default for every import; it isn't remembered.
  const [visibility, setVisibility] = useState<ImportVisibility>('public')
  const [dragging, setDragging] = useState(false)

  const pick = (candidate?: File | null) => {
    if (!candidate) return
    if (!isTextFile(candidate)) {
      toast.error(t('file.wrongType'))
      return
    }
    setFile(candidate)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    pick(e.dataTransfer.files?.[0])
  }

  const onReset = () => {
    reset()
    setFile(null)
  }

  if (step !== UploadStep.None) {
    return (
      <ImportProgress
        step={step}
        at={at}
        count={count}
        errors={errors}
        failedStep={failedStep}
        result={result}
        libraryHref={libraryHref}
        onReset={onReset}
      />
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <Section title={t('file.title')} headingLevel={2}>
        <div
          onDragEnter={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={(e) => {
            // moving onto a child fires dragleave too; only leaving counts
            if (!e.currentTarget.contains(e.relatedTarget as Node | null))
              setDragging(false)
          }}
          onDrop={onDrop}
          className={cn(
            'rounded-lake-panel flex flex-col items-center gap-3 border border-dashed px-6 py-12 text-center transition-colors duration-150 focus-within:ring-2 focus-within:ring-lake-ring',
            dragging
              ? 'border-lake-accent bg-lake-accent-soft'
              : 'border-lake-line-strong bg-lake-surface'
          )}
        >
          <FileText className="text-lake-fg-subtle size-8" aria-hidden="true" />
          {file ? (
            <p className="text-lake-fg font-medium">
              {t('file.selected', {
                name: file.name,
                size: formatSize(file.size),
              })}
            </p>
          ) : null}
          <label className="text-lake-fg cursor-pointer text-sm">
            {file ? null : `${t('file.drop')} `}
            <span className="text-lake-accent-text font-medium underline-offset-4 hover:underline">
              {file ? t('file.change') : t('file.browse')}
            </span>
            <input
              type="file"
              accept=".txt,text/plain"
              className="sr-only"
              onChange={(e) => pick(e.target.files?.[0])}
            />
          </label>
          <p className="type-meta">{t('file.hint')}</p>
        </div>
      </Section>

      <Section title={t('visibility.title')} headingLevel={2}>
        <VisibilityChoice value={visibility} onChange={setVisibility} />
      </Section>

      <Button
        variant="primary"
        size="lg"
        className="self-start"
        disabled={!file}
        leadingIcon={<Upload className="size-4" />}
        onClick={() =>
          file && start(file, { visible: toVisibleFlag(visibility) })
        }
      >
        {visibility === 'public' ? t('submit') : t('submitPrivate')}
      </Button>
    </div>
  )
}

export default ImportPanel
