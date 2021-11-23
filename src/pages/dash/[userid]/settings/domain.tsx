import React from 'react'
import { useFormik } from 'formik'
import { useMutation } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import * as Yup from 'yup'
import { APP_URL_ORIGIN } from '../../../../constants/config'
import updateProfileMutation from '../../../../schema/mutations/update-profile.graphql'
import { updateProfile, updateProfileVariables } from '../../../../schema/mutations/__generated__/updateProfile'

type DomainBarProps = {
  domain: string
}

const domainFormValidationSchema = Yup.object().shape({
  domain: Yup.string().min(3).max(32).trim().lowercase().required()
})

function DomainBar(props: DomainBarProps) {
  const { t } = useTranslation()
  const [doUpdate] = useMutation<updateProfile, updateProfileVariables>(updateProfileMutation)
  const f = useFormik({
    initialValues: {
      domain: ''
    },
    validationSchema: domainFormValidationSchema,
    onSubmit(val) {
      // TODO:
      // 不能以特殊字符起头
      // 正则判定
      if (val.domain.startsWith('.')) {
        return
      }
      if (val.domain.endsWith('.')) {
        return
      }
      doUpdate({
        variables: {
          domain: val.domain
        }
      }).then(res => {
        toast.success(t('app.common.done'))
      }).catch(err => {
        toast.error(err.toString())
      })
    }
  })

  if (props.domain.length > 3) {
    return (
      <input
        className='p-4'
        type='text'
        max={32}
        min={3}
        value={props.domain}
        disabled
      />
    )
  }

  return (
    <form onSubmit={f.handleSubmit}>
      <fieldset>
        <input
          type="text"
          max={32}
          min={3}
          name='domain'
          value={f.values.domain}
          onChange={f.handleChange}
        />
        <p>link will be like this: <code>{APP_URL_ORIGIN}/{f.values.domain}</code></p>
        {f.errors.domain && (
          <p>{f.errors.domain}</p>
        )}
      </fieldset>
      <button type="submit">{t('app.common.doUpdate')}</button>
    </form>
  )
}

export default DomainBar
