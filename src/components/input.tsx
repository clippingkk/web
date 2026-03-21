import type React from 'react'
import { useTranslation } from 'react-i18next'

export enum FieldInputSize {
  small,
  normal,
  large,
}

const sizeWidth = {
  [FieldInputSize.large]: 'lg:w-144 w-96',
  [FieldInputSize.small]: 'lg:w-96 w-64',
  [FieldInputSize.normal]: 'lg:w-144 w-96',
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

function FieldInput(props: FieldInputProps) {
  const { t } = useTranslation()
  const size = props.size ?? FieldInputSize.large
  return (
    <div className="relative mx-0 my-4 flex items-center">
      <label
        htmlFor={props.name}
        className="mr-4 w-32 text-right text-2xl dark:text-white"
      >
        {t(`app.auth.${props.name}`)}:{' '}
      </label>
      <input
        {...props.inputProps}
        type={props.type ?? 'text'}
        className={`border-2 p-4 text-2xl ${(sizeWidth as any)[size]} bg-gray-400 focus:outline-hidden disabled:text-gray-500 ${
          props.error ? 'border-red-400' : 'border-transparent'
        }`}
        value={props.value}
        placeholder={t(`app.auth.${props.name}`) ?? ''}
        name={props.name}
        onChange={props.onChange}
      />
      {props.tail}
      {props.error && (
        <span className="absolute right-0 bottom-0 translate-y-4 transform text-right text-base text-red-500 dark:text-red-900">
          {props.error}
        </span>
      )}
    </div>
  )
}

export default FieldInput
