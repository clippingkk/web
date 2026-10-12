import EmptyState from '@annatarhe/lake-ui/empty-state'
import { NotebookPen } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { SettingsSection } from '@/components/settings/settings-section'
import { getTranslation } from '@/i18n'
import { pageMetadata } from '@/lib/metadata'
import { requireViewer } from '@/server/data/viewer'
import { listReaderNotes } from '@/server/email-import/notes'
import { formatDate } from '@/utils/format-date'
import { clippingHref } from '@/utils/profile.utils'

const LIMIT = 100

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation(undefined, 'settings')
  return pageMetadata({ title: t('notes.title') })
}

/** A plain list of the reader's Kindle notes; a proper home comes later. */
export default async function NotesSettingsPage() {
  const [viewer, { t, i18n }] = await Promise.all([
    requireViewer(),
    getTranslation(undefined, 'settings'),
  ])
  const { notes, total } = await listReaderNotes(viewer.id, LIMIT)
  const position = (pageAt: string) =>
    pageAt.startsWith('#')
      ? t('notes.location', { value: pageAt.slice(1) })
      : t('notes.page', { value: pageAt })

  return (
    <SettingsSection
      title={t('notes.title')}
      description={
        total > notes.length
          ? `${t('notes.description')} ${t('notes.latest', { shown: notes.length, total })}`
          : t('notes.description')
      }
    >
      {notes.length ? (
        <ul className="flex flex-col gap-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="bg-lake-surface border-lake-line rounded-lake-panel flex flex-col gap-2 border p-4"
            >
              <div className="type-meta flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-lake-fg font-reading font-medium">
                  {note.title}
                </span>
                {note.pageAt ? <span>{position(note.pageAt)}</span> : null}
                <span>{formatDate(note.createdAt, i18n.language)}</span>
              </div>
              <p className="type-body text-lake-fg whitespace-pre-line">
                {note.content}
              </p>
              {note.clippingId ? (
                <Link
                  href={clippingHref(viewer, note.clippingId)}
                  className="text-lake-accent-text rounded-lake-control focus-visible:ring-lake-ring self-start text-sm transition-colors duration-150 outline-none hover:underline focus-visible:ring-2"
                >
                  {t('notes.viewHighlight')}
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<NotebookPen className="size-6" />}
          title={t('notes.emptyTitle')}
          description={t('notes.emptyDescription')}
        />
      )}
    </SettingsSection>
  )
}
