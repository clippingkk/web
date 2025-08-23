'use client'
import InputField from '@annatarhe/lake-ui/form-input-field'
import Tooltip from '@annatarhe/lake-ui/tooltip'
import { useMutation } from '@apollo/client/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { z } from 'zod'
import Button from '@/components/button'
import {
  CreateNewWebHookDocument,
  type CreateNewWebHookMutation,
  WebHookStep,
} from '@/gql/graphql'
import { useTranslation } from '@/i18n/client'

type Props = {
  onClose: () => void
  isPremium: boolean
}

function WebHookCreate({ onClose, isPremium }: Props) {
  const { t } = useTranslation()
  const router = useRouter()
  const formSchema = z.object({
    hookUrl: z
      .string()
      .url(t('app.settings.webhook.invalidUrl') || 'Invalid URL')
      .max(
        255,
        t('app.settings.webhook.urlTooLong') ||
          'URL must be at most 255 characters'
      ),
  })

  type FormValues = z.infer<typeof formSchema>

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid, isSubmitting },
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hookUrl: '',
    },
  })
  const [createMutation] = useMutation<CreateNewWebHookMutation>(
    CreateNewWebHookDocument,
    {
      onCompleted() {
        toast.success(t('app.common.done'))
        reset()
        router.refresh()
        onClose()
      },
      onError(err) {
        toast.error(err.message)
      },
    }
  )

  const hookUrl = watch('hookUrl')
  const isFormValid = isValid && hookUrl.length > 3

  const onSubmit = async (data: FormValues) => {
    if (!isFormValid) {
      return
    }

    createMutation({
      variables: {
        step: WebHookStep.OnCreateClippings,
        hookUrl: data.hookUrl,
      },
    })
  }

  return (
    <form className='w-full p-4' onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name='hookUrl'
        control={control}
        render={({ field }) => (
          <InputField
            {...field}
            type='url'
            label='Hook URL'
            className='flex w-full items-center'
            placeholder='https://example.com'
          />
        )}
      />

      <div className='mt-6 flex justify-end gap-4'>
        <Button type='button' onClick={onClose}>
          {t('app.common.cancel')}
        </Button>

        <Tooltip
          disabled={isFormValid && isPremium}
          content={
            !isPremium
              ? t('app.payment.webhookRequired')
              : errors.hookUrl?.message
          }
        >
          <Button
            disabled={!isFormValid || !isPremium}
            loading={isSubmitting}
            type='submit'
          >
            {t('app.settings.webhook.submit')}
          </Button>
        </Tooltip>
      </div>
    </form>
  )
}

export default WebHookCreate
