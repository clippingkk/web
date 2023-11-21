import { useMutation, useQuery } from '@apollo/client'
import { useFormik } from 'formik'
import React, { useCallback, useEffect, useState } from 'react'
import * as Yup from 'yup'
import Dialog from '../../../../components/dialog/dialog'
import FieldInput from '../../../../components/input'
import FieldTextarea from '../../../../components/textarea'
import { toast } from 'react-hot-toast'
import { uploadImage } from '../../../../services/misc'
import { useTranslation } from 'react-i18next'
import ExternalAccountList from '../../../../components/externalAccount/list'
import { useUpdateProfileMutation } from '../../../../schema/generated'
import { Button, Tooltip } from '@mantine/core'
import { CogIcon } from '@heroicons/react/24/solid'

type ProfileEditorProps = {
  uid: number
  withNameChange: boolean
  bio: string
  domain: string

  withProfileEditor?: string
}

function ProfileEditor(props: ProfileEditorProps) {
  const [visible, setVisible] = useState(false)
  const withProfileEditor = props.withProfileEditor
  useEffect(() => {
    if (withProfileEditor) {
      setVisible(true)
    }
  }, [withProfileEditor])

  const [doUpdate, { client }] = useUpdateProfileMutation()
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
      avatar: Yup.mixed().optional().nullable()
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

      try {
        await doUpdate({
          variables: {
            name: vals.name !== '' ? vals.name : null,
            avatar: avatarUrl !== '' ? avatarUrl : null,
            bio: vals.bio !== '' ? vals.bio : null,
            domain
          }
        })
        formik.resetForm()
        setVisible(false)
        client.resetStore()
        toast.success(t('app.profile.editor.updated'))
      } catch (err: any) {
        console.error(err)
        toast.error(err)
      }
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
      <Tooltip
        label={t('app.profile.editor.title')}
        withArrow
        transitionProps={{ transition: 'pop', duration: 200 }}
      >
        <Button
          onClick={() => setVisible(true)}
          bg='transparent'
          title={t('app.profile.editor.title') ?? ''}
        >
          <CogIcon className='w-6 h-6' />
        </Button>
      </Tooltip>
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
                <Button
                  className='bg-blue-400 hover:bg-blue-500 duration-300 hover:shadow-lg rounded-sm px-4 py-2 disabled:text-gray-500'
                  type='submit'
                  disabled={(!formik.isValid) || (
                    false
                    // formik.values.name === '' &&
                    // formik.values.bio === '' &&
                    // (!formik.values.avatar) &&
                    // (props.domain.length > 2 ? true : formik.values.domain.length < 3)
                  )}
                >
                  {t('app.common.doUpdate')}
                </Button>
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
