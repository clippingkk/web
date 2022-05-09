import { useMutation, useQuery } from '@apollo/client'
import { useFormik } from 'formik'
import React, { useCallback, useEffect, useState } from 'react'
import * as Yup from 'yup'
import Dialog from '../../../../components/dialog/dialog'
import updateProfileMutation from '../../../../schema/mutations/update-profile.graphql'
import FieldInput from '../../../../components/input'
import FieldTextarea from '../../../../components/textarea'
import { updateProfile, updateProfileVariables } from '../../../../schema/mutations/__generated__/updateProfile'
import { toast } from 'react-toastify'
import { uploadImage } from '../../../../services/misc'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import ExternalAccountList from '../../../../components/externalAccount/list'

type ProfileEditorProps = {
  uid: number
  withNameChange: boolean
  bio: string
  domain: string
}

function ProfileEditor(props: ProfileEditorProps) {
  const [visible, setVisible] = useState(false)
  const withProfileEditor = useRouter().query.with_profile_editor
  useEffect(() => {
    if (withProfileEditor) {
      setVisible(true)
    }
  }, [withProfileEditor])

  const [doUpdate, { client }] = useMutation<updateProfile, updateProfileVariables>(updateProfileMutation)
  const { t } = useTranslation()
  const formik = useFormik({
    initialValues: {
      name: '',
      bio: '',
      domain: props.domain,
      avatar: null as File | null
    },
    validationSchema: Yup.object({
      name: Yup.string(),
      bio: Yup.string().max(255),
      domain: Yup.string().min(3).max(32).trim().lowercase().matches(/^\w+[\.|-]?\w+$/),
      avatar: Yup.mixed()
    }),
    async onSubmit(vals) {
      // pre upload image here
      if (vals.bio.split('\n').length > 4) {
        toast.error(t('app.profile.editor.max4line'))
        return
      }
      if (!formik.isValid) {
        toast.error(t('app.profile.editor.invalid'))
        return
      }
      let avatarUrl = ''
      if (vals.avatar) {
        try {
          const resp = await uploadImage(vals.avatar)
          avatarUrl = resp.filePath
        } catch (e: any) {
          toast.error(e)
          throw e
        }
      }

      // 因为不能重复填写
      const domain = props.domain.length > 2 ? '' : vals.domain

      doUpdate({
        variables: {
          name: vals.name !== '' ? vals.name : null,
          avatar: avatarUrl !== '' ? avatarUrl : null,
          bio: vals.bio !== '' ? vals.bio : null,
          domain
        }
      }).then(() => {
        formik.resetForm()
        setVisible(false)
        client.resetStore()
        toast.success(t('app.profile.editor.updated'))
      }).catch(err => {
        console.error(err)
        toast.error(err)
      })
    }
  })

  useEffect(() => {
    formik.setFieldValue('bio', props.bio)
  }, [props.bio])

  const onEditCancel = useCallback(() => {
    formik.resetForm()
    setVisible(false)
  }, [])

  return (
    <React.Fragment>
      <button
        className='text-2xl ml-4 p-2 transform transition-all hover:scale-110 duration-300 hover:bg-blue-400 hover:bg-opacity-50 focus:outline-none'
        onClick={() => setVisible(true)}
        title={t('app.profile.editor.title')}
      >⚙</button>
      {visible && (
        <Dialog
          title={t('app.profile.editor.title')}
          onCancel={onEditCancel}
          onOk={() => {
            formik.handleSubmit()
          }}
        >
          <div>
            <form className='flex flex-col' onSubmit={formik.handleSubmit}>
              {props.withNameChange && (
                <FieldInput
                  type='text'
                  name='name'
                  onChange={formik.handleChange}
                  error={formik.errors.name}
                  value={formik.values.name}
                />
              )}
              <FieldInput
                type='text'
                name='domain'
                onChange={formik.handleChange}
                inputProps={{
                  disabled: props.domain.length > 2
                }}
                error={formik.errors.domain}
                value={formik.values.domain}
              />
              <FieldInput
                type='file'
                name='avatar'
                error={formik.errors.avatar}
                onChange={e => {
                  if (!e.target.files) {
                    return
                  }
                  const f = e.target.files[0]
                  formik.setFieldValue('avatar', f)
                }}
                inputProps={{
                  accept: "image/png, image/jpeg"
                }}
                value={undefined}
              />
              <FieldTextarea
                name='bio'
                onChange={formik.handleChange}
                error={formik.errors.bio}
                value={formik.values.bio}
                inputProps={{
                  rows: 4
                }}
              />

              <div className='flex items-center justify-end'>
                <button className='hover:bg-gray-200 hover:shadow-lg duration-300 rounded-sm px-4 py-2 mr-4' onClick={onEditCancel}>
                  {t('app.common.cancel')}
                </button>
                <button
                  className='bg-blue-400 hover:bg-blue-500 duration-300 hover:shadow-lg rounded-sm px-4 py-2 disabled:text-gray-500'
                  type='submit'
                  disabled={(!formik.isValid) || (
                    formik.values.name === '' &&
                    formik.values.bio === '' &&
                    (!formik.values.avatar) &&
                    (props.domain.length > 2 ? true : formik.values.domain.length < 3)
                  )}
                >
                  {t('app.common.doUpdate')}
                </button>
              </div>
            </form>

            <hr className='my-10' />
            {visible && (
              <ExternalAccountList
                uid={props.uid}
              />
            )}
          </div>
        </Dialog>
      )}
    </React.Fragment>
  )
}

export default ProfileEditor
