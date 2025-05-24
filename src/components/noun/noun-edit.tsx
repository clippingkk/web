import { useTranslation } from '@/i18n/client'
import InputField from '@annatarhe/lake-ui/form-input-field'
import SelectField from '@annatarhe/lake-ui/form-select-field'
import TextareaField from '@annatarhe/lake-ui/form-textarea-field'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import {
  NounScope,
  useCreateNounMutationMutation,
  useFetchNounQuery,
  useUpdateNounMutationMutation,
} from '../../schema/generated'
import { toastPromiseDefaultOption } from '../../services/misc'

type NounEditContentProps = {
  id: -1 | number
  noun: string
  bookId?: string
  clippingId?: number
  isPremium?: boolean
  isGrandAdmin?: boolean
  onClose: () => void
}

const schema = z.object({
  id: z.number().optional(),
  noun: z.string().max(100),
  content: z.string().max(10000),
  bookId: z.string().optional().nullable(),
  clippingId: z.number().optional().nullable(),
  scope: z.enum(['all', 'book', 'clipping', 'forbid']),
})

type FormValues = z.infer<typeof schema>

// TODO: support BookId and ClippingID editing
function NounEditContent(props: NounEditContentProps) {
  const { id, noun, onClose } = props
  const { t } = useTranslation()

  const [createNoun, { loading: createLoading }] =
    useCreateNounMutationMutation({
      onCompleted: () => {
        onClose()
      },
    })
  const [updateNoun, { loading: updateLoading }] =
    useUpdateNounMutationMutation({
      onCompleted: () => {
        onClose()
      },
    })

  const { control, handleSubmit, setValue, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id,
      noun,
      scope: NounScope.All,
    },
  })

  const { data: fetchedNoun, loading } = useFetchNounQuery({
    variables: {
      id,
    },
    skip: id < 0,
  })

  useEffect(() => {
    if (!fetchedNoun) {
      return
    }
    const n = fetchedNoun.noun
    setValue('noun', n.noun)
    setValue('content', n.content)
    setValue('bookId', n.bookId)
    setValue('scope', NounScope.All)
  }, [fetchedNoun, setValue])

  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])

  const onSubmit = handleSubmit((data) => {
    if (id === -1) {
      toast.promise(
        createNoun({
          variables: {
            input: {
              noun: data.noun!,
              content: data.content,
              scope: data.scope as NounScope,
            },
          },
        }),
        toastPromiseDefaultOption
      )
    } else {
      toast.promise(
        updateNoun({
          variables: {
            id,
            input: {
              content: data.content,
              scope: data.scope as NounScope,
            },
          },
        }),
        toastPromiseDefaultOption
      )
    }
  })

  if (!id) {
    return null
  }

  if (id > 0 && loading) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-[#045fab]" />
      </div>
    )
  }

  return (
    <div className="w-full">
      <form onSubmit={onSubmit}>
        <Controller
          name="id"
          control={control}
          disabled
          render={({ field }) => (
            <InputField
              {...field}
              type="number"
              label={t('app.nouns.form.id.label')}
              disabled
            />
          )}
        />

        <Controller
          name="scope"
          control={control}
          render={({ field }) => (
            <SelectField
              {...field}
              label={t('app.nouns.form.scope.label')}
              options={[
                { value: 'all', label: t('app.nouns.form.scope.data.all') },
                { value: 'book', label: t('app.nouns.form.scope.data.book') },
                {
                  value: 'clipping',
                  label: t('app.nouns.form.scope.data.clipping'),
                },
                {
                  value: 'forbid',
                  label: t('app.nouns.form.scope.data.forbid'),
                },
              ]}
            />
          )}
        />

        <Controller
          name="noun"
          control={control}
          render={({ field }) => (
            <InputField
              {...field}
              label={t('app.nouns.form.noun.label')}
              disabled
            />
          )}
        />

        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <TextareaField
              {...field}
              rows={10}
              label={t('app.nouns.form.content.label')}
              placeholder={t('app.nouns.form.content.placeholder')}
            />
          )}
        />

        <div className="my-8 border-t border-gray-300/20 dark:border-gray-700/30" />

        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            onClick={() => {
              onClose()
              reset()
            }}
          >
            {t('app.nouns.form.cancel')}
          </button>

          <button
            type="submit"
            disabled={createLoading || updateLoading}
            className="rounded-md bg-[#045fab] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-70"
          >
            {createLoading || updateLoading ? (
              <span className="flex items-center gap-2">
                <Loader className="h-4 w-4 animate-spin" />
                {t('app.nouns.form.submitting')}
              </span>
            ) : (
              t('app.nouns.form.submit')
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default NounEditContent
