import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

import { Theme, themes } from './theme.config'

type ThemePickerProps = {
  disabled?: boolean
  className?: string
  current: Theme
  onChange: (t: Theme) => void
}

/** Swatches painted with each poster's own background. */
function ThemePicker(props: ThemePickerProps) {
  return (
    <div className={cn('flex flex-wrap gap-x-2 gap-y-3', props.className)}>
      {themes.map((theme) => {
        const isSelected = props.current === theme.id
        return (
          <button
            key={theme.id}
            type="button"
            disabled={props.disabled}
            onClick={() => props.onChange(theme.id)}
            aria-pressed={isSelected}
            className="group rounded-lake-control focus-visible:ring-lake-ring flex w-14 flex-col items-center gap-2 py-1 outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span
              aria-hidden="true"
              style={{ background: theme.background, color: theme.color }}
              className={cn(
                'border-lake-line-strong ring-offset-lake-surface-raised flex size-10 items-center justify-center rounded-full border ring-offset-2 transition-shadow duration-150 motion-reduce:transition-none',
                isSelected
                  ? 'ring-lake-accent ring-2'
                  : 'group-hover:ring-lake-line-strong group-hover:ring-1'
              )}
            >
              {isSelected ? (
                <Check className="size-4" strokeWidth={2.5} />
              ) : null}
            </span>
            <span
              className={cn(
                'text-xs transition-colors duration-150',
                isSelected ? 'text-lake-fg font-medium' : 'text-lake-fg-muted'
              )}
            >
              {theme.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default ThemePicker
