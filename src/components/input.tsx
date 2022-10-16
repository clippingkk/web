import React from 'react'
import { useTranslation } from 'react-i18next'

export enum FieldInputSize {
  small,
  normal,
  large
}

const sizeWidth = {
  [FieldInputSize.large]: 'lg:w-144 w-96',
  [FieldInputSize.small]: 'lg:w-96 w-64',
  [FieldInputSize.normal]: 'lg:w-144 w-96'
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
    <div className='my-4 mx-0 flex items-center relative'>
        <label
          htmlFor={props.name}
          className='mr-4 text-2xl w-32 text-right dark:text-white'
        >{t(`app.auth.${props.name}`)}: </label>
      <input
        {...props.inputProps}
        type={props.type ?? 'text'}
        className={`text-2xl p-4 border-2 ${(sizeWidth as any)[size]} bg-gray-400 focus:outline-none disabled:text-gray-500 ` + (props.error ? 'border-red-400' : 'border-transparent')}
        value={props.value}
        placeholder={t(`app.auth.${props.name}`)}
        name={props.name}
        onChange={props.onChange}
      />
      {props.tail}
      {props.error && (
        <span className='absolute bottom-0 right-0 text-right transform translate-y-4 text-red-500 dark:text-red-900 text-base'>
          {props.error}
        </span>
      )}
    </div>
  )
}


export default FieldInput
