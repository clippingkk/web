'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import InputField from '@annatarhe/lake-ui/form-input-field'
import FieldTextarea from '@/components/textarea'
import { toast } from 'react-hot-toast'
import { uploadImage } from '@/services/misc'
import { useTranslation } from 'react-i18next'
import ExternalAccountList from '@/components/externalAccount/list'
import { useUpdateProfileMutation } from '@/schema/generated'
import { Button } from '@mantine/core'
import Tooltip from '@annatarhe/lake-ui/tooltip'
import Modal from '@annatarhe/lake-ui/modal'
import { CogIcon } from '@heroicons/react/24/solid'

type ProfileEditorProps = {
  uid: number
  withNameChange: boolean
  bio: string
  domain: string

  withProfileEditor?: string
}

const profileFormSchema = z.object({
  name: z.string().optional(),
  bio: z.string().max(255).optional(),
  domain: z.string().min(3).max(32).trim().toLowerCase().regex(/^\w+[\.|-]?\w+$/),
  avatar: z.instanceof(File).nullable().optional()
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

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
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isValid },
    reset,
    setValue,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      bio: '',
      domain: props.domain,
      avatar: null
    }
  })
  
  const onSubmit = async (values: ProfileFormValues) => {
    // pre upload image here
    if (values.bio && values.bio.split('\n').length > 4) {
      toast.error(t('app.profile.editor.max4line'))
      return
    }
    if (!isValid) {
      toast.error(t('app.profile.editor.invalid'))
      return
    }
    
    let avatarUrl = ''
    if (values.avatar) {
      try {
        const resp = await uploadImage(values.avatar)
        avatarUrl = resp.filePath
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        toast.error(e)
        throw e
      }
    }

    // 因为不能重复填写
    const domain = props.domain.length > 2 ? '' : values.domain

    try {
      await doUpdate({
        variables: {
          name: values.name && values.name !== '' ? values.name : null,
          avatar: avatarUrl !== '' ? avatarUrl : null,
          bio: values.bio && values.bio !== '' ? values.bio : null,
          domain
        }
      })
      reset()
      setVisible(false)
      client.resetStore()
      toast.success(t('app.profile.editor.updated'))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err)
      toast.error(err)
    }
  }

  useEffect(() => {
    setValue('bio', props.bio)
  }, [props.bio, setValue])

  const onEditCancel = useCallback(() => {
    reset()
    setVisible(false)
  }, [reset])

  return (
    <React.Fragment>
      <Tooltip
        content={t('app.profile.editor.title')}
      >
        <Button
          onClick={() => setVisible(true)}
          bg='transparent'
          title={t('app.profile.editor.title') ?? ''}
        >
          <CogIcon className='w-6 h-6' />
        </Button>
      </Tooltip>
      <Modal
        isOpen={visible}
        title={t('app.profile.editor.title')}
        onClose={onEditCancel}
      >
        <div className='p-4'>
          <form className='flex flex-col' onSubmit={handleSubmit(onSubmit)}>
            {props.withNameChange && (
              <InputField
                type='text'
                {...register('name')}
                error={errors.name?.message}
              />
            )}
            <InputField
              type='text'
              {...register('domain')}
              disabled={props.domain.length > 2}
              error={errors.domain?.message}
            />
            <FieldTextarea
              {...register('bio')}
              error={errors.bio?.message}
              inputProps={{
                rows: 4
              }}
            />

            <div className='flex items-center justify-end'>
              <button className='hover:bg-gray-200 hover:shadow-lg duration-300 rounded-xs px-4 py-2 mr-4' onClick={onEditCancel}>
                {t('app.common.cancel')}
              </button>
              <Button
                className='bg-blue-400 hover:bg-blue-500 duration-300 hover:shadow-lg rounded-xs px-4 py-2 disabled:text-gray-500'
                type='submit'
                disabled={!isValid}
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
      </Modal>
    </React.Fragment>
  )
}

export default ProfileEditor
