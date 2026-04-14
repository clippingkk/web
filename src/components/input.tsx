import type React from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

export enum FieldInputSize {
  small,
  normal,
  large,
}

const sizeWidth = {
  [FieldInputSize.large]: 'w-full max-w-xl',
  [FieldInputSize.small]: 'w-full max-w-xs',
  [FieldInputSize.normal]: 'w-full max-w-md',
}

type FieldInputProps = {
  type?: string
  name: string
  value?: string
  inputProps?: object
  error?: string
  size?: FieldInputSize
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  tail?: React.ReactElement
}

/**
 * FieldInput — modernized labelled input used by the onboarding flow.
 * Visually aligned with `@annatarhe/lake-ui/form-input-field` (rounded-lg,
 * blue-400 focus ring, subtle borders, dark-mode aware). Kept as a thin
 * local component because the sole caller needs a bespoke API around file
 * inputs.
 */
function FieldInput(props: FieldInputProps) {
  const { t } = useTranslation()
  const size = props.size ?? FieldInputSize.large
  const label = t(`app.auth.${props.name}`) ?? ''
  return (
    <div className="relative my-4 flex w-full flex-col gap-2 md:flex-row md:items-center md:gap-4">
      <label
        htmlFor={props.name}
        className="text-sm font-medium text-slate-700 md:w-32 md:text-right dark:text-slate-200"
      >
        {label}
      </label>
      <div className={cn('flex items-center gap-2', sizeWidth[size])}>
        <input
          {...props.inputProps}
          id={props.name}
          type={props.type ?? 'text'}
          className={cn(
            'w-full rounded-lg border bg-white/80 px-4 py-2.5 text-base text-slate-900 shadow-sm transition-all outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-400/60 disabled:cursor-not-allowed disabled:text-slate-400 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500',
            props.error
              ? 'border-rose-400 focus:border-rose-400'
              : 'border-slate-200 focus:border-blue-400 dark:border-slate-700'
          )}
          value={props.value}
          placeholder={label}
          name={props.name}
          onChange={props.onChange}
        />
        {props.tail}
      </div>
      {props.error && (
        <span className="absolute right-0 -bottom-5 text-xs text-rose-500 dark:text-rose-400">
          {props.error}
        </span>
      )}
    </div>
  )
}

export default FieldInput
