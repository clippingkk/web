'use client'

import Button from '@annatarhe/lake-ui/button'
import { Search } from 'lucide-react'
import { useState } from 'react'

import BookMatchSheet from '@/components/book/book-match-sheet'
import { splitClippingLines } from '@/components/clipping/clipping-text'
import { useTranslation } from '@/i18n/client'

export type UncheckedGroupData = {
  title: string
  count: number
  clippingId: number
  sample: string
}

function UncheckedGroup({ group }: { group: UncheckedGroupData }) {
  const { t } = useTranslation(undefined, 'library')
  const [open, setOpen] = useState(false)
  const sample = splitClippingLines(group.sample, 1)[0] ?? ''

  return (
    <li className="border-lake-line flex flex-col gap-3 border-b py-6 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
      <div className="min-w-0 flex-1">
        <h2 className="font-reading text-lake-fg text-lg font-semibold">
          {group.title || '—'}
        </h2>
        <p className="type-meta mt-0.5">
          {t('unchecked.group', { count: group.count })}
        </p>
        {sample ? (
          <p className="type-quote text-lake-fg-muted before:bg-marker relative mt-3 line-clamp-3 pl-4 before:absolute before:top-1.5 before:bottom-1.5 before:left-0 before:w-0.5 before:rounded-full">
            {sample}
          </p>
        ) : null}
      </div>
      <Button
        variant="secondary"
        size="sm"
        className="w-fit shrink-0"
        leadingIcon={<Search className="size-4" />}
        onClick={() => setOpen(true)}
      >
        {t('unchecked.findBook')}
      </Button>
      {open ? (
        <BookMatchSheet
          open={open}
          onClose={() => setOpen(false)}
          clippingId={group.clippingId}
          title={group.title}
        />
      ) : null}
    </li>
  )
}

export default UncheckedGroup
