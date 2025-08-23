'use client'
import InputField from '@annatarhe/lake-ui/form-input-field'
import Modal from '@annatarhe/lake-ui/modal'
import { useMutation, useSuspenseQuery } from '@apollo/client/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { z } from 'zod/v4'
import {
  ExportDataToDocument,
  type ExportDataToMutation,
  type ExportDataToMutationVariables,
  ExportDestination,
  ProfileDocument,
  type ProfileQuery,
  type ProfileQueryVariables,
} from '@/gql/graphql'
import { useTranslation } from '@/i18n/client'

function ExportToMail() {
  const [visible, setVisible] = useState(false)
  const open = () => setVisible(true)
  const close = () => setVisible(false)
  const { t } = useTranslation()

  const userDomain = useParams<{ userid: string }>().userid
  const isTypeUid = !Number.isNaN(parseInt(userDomain, 10))
  const { data: p } = useSuspenseQuery<ProfileQuery, ProfileQueryVariables>(
    ProfileDocument,
    {
      variables: {
        id: isTypeUid ? ~~userDomain : undefined,
        domain: isTypeUid ? undefined : userDomain,
      },
    }
  )

  const formSchema = z.object({
    endpoint: z
      .string()
      .email(
        t('app.settings.export.email.invalidEmail') || 'Invalid email address'
      )
      .max(255),
  })

  type FormValues = z.infer<typeof formSchema>

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      endpoint: p.me.email || '',
    },
  })

  const [mutate] = useMutation<
    ExportDataToMutation,
    ExportDataToMutationVariables
  >(ExportDataToDocument, {
    onCompleted() {
      toast.success(t('app.settings.export.success'))
      reset()
      close()
    },
    onError(err) {
      toast.error(err.message)
    },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      const result = await mutate({
        variables: {
          destination: ExportDestination.Mail,
          args: data.endpoint,
        },
      })

      if (result.error) {
        throw new Error(result.error.message)
      }
    } catch (err) {
      // Error is already handled by the mutation's onError callback
      console.error(err)
    }
  }
  return (
    <>
      <button
        onClick={open}
        className='flex h-full w-full flex-col items-center justify-center rounded-lg bg-white p-4 transition-colors duration-200 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:bg-gray-800 dark:hover:bg-gray-700/80 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-900'
      >
        <Mail className='mb-3 h-12 w-12 text-blue-600 dark:text-blue-400' />
        <span className='font-medium text-gray-800 dark:text-gray-200'>
          {t('app.settings.export.email.button', 'Email')}
        </span>
      </button>
      <Modal
        isOpen={visible}
        onClose={close}
        title={t('app.settings.export.email.title')}
      >
        <form className='w-full p-4' onSubmit={handleSubmit(onSubmit)}>
          <p className='mb-4 text-gray-700 dark:text-gray-300'>
            {t('app.settings.export.email.tips')}
          </p>

          <div className='mb-4'>
            <Controller
              name='endpoint'
              control={control}
              render={({ field }) => (
                <InputField
                  {...field}
                  type='email'
                  placeholder={t('app.settings.export.email.title')}
                  className='w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400'
                />
              )}
            />
          </div>

          <div className='mt-4 flex w-full justify-end'>
            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full rounded-lg bg-blue-600 px-5 py-2 font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none active:scale-95 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70 dark:focus:ring-offset-gray-900'
            >
              {isSubmitting ? (
                <span className='flex items-center justify-center'>
                  <svg
                    className='mr-2 -ml-1 h-4 w-4 animate-spin text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  {t('app.common.loading', 'Loading...')}
                </span>
              ) : (
                t('app.settings.export.email.submit')
              )}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default ExportToMail
