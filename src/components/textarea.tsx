import type React from 'react'
import { useTranslation } from '@/i18n/client'

type FieldTextareaProps = {
  type?: string
  name: string
  value?: string
  inputProps?: object
  error?: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

function FieldTextarea(props: FieldTextareaProps) {
  const { t } = useTranslation()
  return (
    <div className="relative mx-0 my-4 flex items-center">
      <label htmlFor={props.name} className="mr-4 w-32 text-right text-2xl">
        {t(`app.auth.${props.name}`)}:{' '}
      </label>
      <textarea
        {...props.inputProps}
        className={
          'w-96 border-2 bg-gray-400 p-4 text-2xl focus:outline-hidden lg:w-144 ' +
          (props.error ? 'border-red-400' : 'border-transparent')
        }
        value={props.value}
        placeholder={t(`app.auth.${props.name}`) ?? ''}
        name={props.name}
        onChange={props.onChange}
      />
      {props.error && (
        <span className="absolute right-0 bottom-0 translate-y-4 transform text-right text-sm text-red-400">
          {props.error}
        </span>
      )}
    </div>
  )
}

export default FieldTextarea
