'use client'
import InputField from '@annatarhe/lake-ui/form-input-field'
import TextareaField from '@annatarhe/lake-ui/form-textarea-field'
import Modal from '@annatarhe/lake-ui/modal'
import Tooltip from '@annatarhe/lake-ui/tooltip'
import { zodResolver } from '@hookform/resolvers/zod'
import { Globe2Icon, PenIcon, Settings, User2Icon } from 'lucide-react'
import React, { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { z } from 'zod'

import Button from '@/components/button/button'
import ExternalAccountList from '@/components/externalAccount/list'
import { useTranslation } from '@/i18n/client'
import { useUpdateProfileMutation } from '@/schema/generated'
import { uploadImage } from '@/services/misc'

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
  domain: z
    .string()
    .min(3)
    .max(32)
    .trim()
    .toLowerCase()
    .regex(/^\w+[.|-]?\w+$/),
  avatar: z.instanceof(File).nullable().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

function ProfileEditor(props: ProfileEditorProps) {
  // Initialize state from prop
  const [visible, setVisible] = useState(() => !!props.withProfileEditor)

  const [doUpdate, { client }] = useUpdateProfileMutation()
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      bio: props.bio,
      domain: props.domain,
      avatar: null,
    },
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
          domain,
        },
      })
      reset()
      setVisible(false)
      client.resetStore()
      toast.success(t('app.profile.editor.updated'))
    } catch (err: any) {
      console.error(err)
      toast.error(err)
    }
  }

  const onEditCancel = useCallback(() => {
    reset()
    setVisible(false)
  }, [reset])

  return (
    <React.Fragment>
      <Tooltip content={t('app.profile.editor.title')}>
        <Button
          onClick={() => setVisible(true)}
          variant="ghost"
          title={t('app.profile.editor.title') ?? ''}
        >
          <Settings className="h-6 w-6" />
        </Button>
      </Tooltip>
      <Modal
        isOpen={visible}
        title={t('app.profile.editor.title')}
        onClose={onEditCancel}
      >
        <div className="p-4">
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            {props.withNameChange && (
              <InputField
                type="text"
                label={
                  <div className="mb-2 flex items-center gap-2">
                    <User2Icon className="h-6 w-6" />
                    <span>Name</span>
                  </div>
                }
                placeholder={'Name'}
                {...register('name')}
                error={errors.name?.message}
              />
            )}
            <InputField
              type="text"
              label={
                <div className="mb-2 flex items-center gap-2">
                  <Globe2Icon className="h-6 w-6" />
                  <span>Domain</span>
                </div>
              }
              placeholder={'Domain'}
              {...register('domain')}
              disabled={props.domain.length > 2}
              error={errors.domain?.message}
            />
            <TextareaField
              label={
                <div className="mb-2 flex items-center gap-2">
                  <PenIcon className="h-6 w-6" />
                  <span>Bio</span>
                </div>
              }
              placeholder={'Bio'}
              {...register('bio')}
              error={errors.bio?.message}
              rows={4}
            />
            <div className="mt-6 flex items-center justify-end gap-4">
              <button
                className="rounded-xl border border-white/40 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-white/90 focus:ring-2 focus:ring-blue-400 focus:outline-none dark:border-slate-800/40 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900/90"
                onClick={onEditCancel}
                type="button"
              >
                {t('app.common.cancel')}
              </button>
              <button
                className={`inline-flex items-center justify-center gap-2 rounded-xl bg-blue-400 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-blue-300 motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:bg-blue-400 dark:text-slate-950 dark:hover:bg-blue-300 ${isSubmitting ? 'cursor-wait' : ''}`}
                type="submit"
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t('app.common.processing')}
                  </span>
                ) : (
                  t('app.common.doUpdate')
                )}
              </button>
            </div>
          </form>

          <hr className="my-10" />
          {visible && <ExternalAccountList uid={props.uid} />}
        </div>
      </Modal>
    </React.Fragment>
  )
}

export default ProfileEditor
