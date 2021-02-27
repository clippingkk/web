import { useMutation } from '@apollo/client'
import { useFormik } from 'formik'
import React, { useCallback, useState } from 'react'
import * as Yup from 'yup'
import Dialog from '../../components/dialog/dialog'
import updateProfileMutation from '../../schema/mutations/update-profile.graphql'
import FieldInput from '../../components/input'
import FieldTextarea from '../../components/textarea'
import { updateProfile, updateProfileVariables } from '../../schema/mutations/__generated__/updateProfile'
import { toast } from 'react-toastify'
import { uploadImage } from '../../services/misc'
import { useTranslation } from 'react-i18next'

type ProfileEditorProps = {
}

function ProfileEditor(props: ProfileEditorProps) {
  const [visible, setVisible] = useState(false)

  const [doUpdate, { client }] = useMutation<updateProfile, updateProfileVariables>(updateProfileMutation)
  const { t } = useTranslation()

  const formik = useFormik({
    initialValues: {
      bio: '',
      avatar: null as File | null
    },
    validationSchema: Yup.object({
      bio: Yup.string().max(255),
      avatar: Yup.mixed()
    }),
    async onSubmit(vals) {
      // pre upload image here
      let avatarUrl = ''
      if (vals.avatar) {
        try {
          const resp = await uploadImage(vals.avatar)
          avatarUrl = resp.filePath
        } catch (e) {
          toast.error(e)
          throw e
        }
      }
      doUpdate({
        variables: {
          avatar: avatarUrl !== '' ? avatarUrl : null,
          bio: vals.bio,
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

  const onEditCancel = useCallback(() => {
    formik.resetForm()
    setVisible(false)
  }, [])

  return (
    <React.Fragment>
      <button
        className='text-2xl ml-4 p-2 transform transition-all hover:scale-110 duration-300 hover:bg-blue-400 hover:bg-opacity-50 focus:outline-none'
        onClick={() => setVisible(true)}
      >⚙</button>
      {visible && (
        <Dialog
          title={t('app.profile.editor.title')}
          onCancel={onEditCancel}
          onOk={() => {
            formik.handleSubmit()
          }}
        >
          <form className='flex flex-col' onSubmit={formik.handleSubmit}>
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
                col: 3
              }}
            />

            <div className='flex items-center justify-end'>
              <button className='hover:bg-gray-200 hover:shadow-lg duration-300 rounded-sm px-4 py-2 mr-4' onClick={onEditCancel}>{t('app.common.cancel')}</button>
              <button className='bg-blue-400 hover:bg-blue-500 duration-300 hover:shadow-lg rounded-sm px-4 py-2' type='submit'>{t('app.common.doUpdate')}</button>
            </div>
          </form>
        </Dialog>
      )}
    </React.Fragment>
  )
}

export default ProfileEditor
