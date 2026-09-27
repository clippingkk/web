'use client'

import SegmentedControl from '@annatarhe/lake-ui/segmented-control'
import { Globe, Lock } from 'lucide-react'

import { useTranslation } from '@/i18n/client'

export type ImportVisibility = 'public' | 'private'

type VisibilityChoiceProps = {
  value: ImportVisibility
  onChange: (value: ImportVisibility) => void
}

/** `visible: true` on createClippings means public. */
export function toVisibleFlag(value: ImportVisibility): boolean {
  return value === 'public'
}

function VisibilityChoice({ value, onChange }: VisibilityChoiceProps) {
  const { t } = useTranslation(undefined, 'import')
  return (
    <div className="flex flex-col gap-2">
      <SegmentedControl
        aria-label={t('visibility.label')}
        value={value}
        onValueChange={onChange}
        options={[
          {
            value: 'public',
            label: t('visibility.public'),
            icon: <Globe className="size-4" />,
          },
          {
            value: 'private',
            label: t('visibility.private'),
            icon: <Lock className="size-4" />,
          },
        ]}
      />
      <p className="text-lake-fg-muted text-sm" aria-live="polite">
        {value === 'public'
          ? t('visibility.publicDescription')
          : t('visibility.privateDescription')}
      </p>
    </div>
  )
}

export default VisibilityChoice
