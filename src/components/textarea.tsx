import React from 'react'
import { useTranslation } from 'react-i18next'

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
    <div className='my-4 mx-0 flex items-center relative'>
      <label
        htmlFor={props.name}
        className='mr-4 text-2xl w-32 text-right'
      >{t(`app.auth.${props.name}`)}: </label>
      <textarea
        {...props.inputProps}
        className={'text-2xl p-4 border-2 lg:w-144 w-96 bg-gray-400 focus:outline-hidden ' + (props.error ? 'border-red-400' : 'border-transparent')}
        value={props.value}
        placeholder={t(`app.auth.${props.name}`) ?? ''}
        name={props.name}
        onChange={props.onChange}
      />
      {props.error && (
        <span className='absolute bottom-0 right-0 text-right transform translate-y-4 text-red-400 text-sm'>
          {props.error}
        </span>
      )}
    </div>
  )
}


export default FieldTextarea
