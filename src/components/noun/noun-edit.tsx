import React, { useEffect } from 'react'
import { Form, useForm, zodResolver } from '@mantine/form'
import { NounScope, useCreateNounMutationMutation, useFetchNounQuery, useUpdateNounMutationMutation } from '../../schema/generated'
import { z } from 'zod'
import { Button, Divider, Fieldset, NumberInput, Select, TextInput, Textarea } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { toastPromiseDefaultOption } from '../../services/misc'
import LoadingIcon from '../icons/loading.svg'

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
  noun: z.string().max(100).readonly(),
  content: z.string().max(10000),
  bookId: z.string().optional().nullable(),
  clippingId: z.number().optional().nullable(),
  scope: z.enum(['all', 'book', 'clipping', 'forbid']),
})

type formType = z.infer<typeof schema>

// TODO: support BookId and ClippingID editing
function NounEditContent(props: NounEditContentProps) {
  const { id, noun, isGrandAdmin, isPremium, onClose } = props

  const [createNoun, { loading: createLoading }] = useCreateNounMutationMutation({
    onCompleted: () => {
      onClose()
    }
  })
  const [updateNoun, { loading: updateLoading }] = useUpdateNounMutationMutation({
    onCompleted: () => {
      onClose()
    }
  })

  const f = useForm<formType>({
    validate: zodResolver(schema),
    initialValues: {
      id,
      noun,
      scope: NounScope.All,
    } as any
  })

  const { data: fetchedNoun, loading } = useFetchNounQuery({
    variables: {
      id
    },
    skip: id < 0
  })

  useEffect(() => {
    if (!fetchedNoun) {
      return
    }
    const n = fetchedNoun.noun
    f.setValues({
      noun: n.noun,
      content: n.content,
      bookId: n.bookId,
      scope: NounScope.All,
    })
  }, [fetchedNoun])

  useEffect(() => {
    return () => {
      f.reset()
    }
  }, [])

  const [t] = useTranslation()

  if (!id) {
    return null
  }

  if (id > 0 && loading) {
    return (
      <div className='min-h-60 flex items-center justify-center'>
        <LoadingIcon />
      </div>
    )
  }

  return (
    <div>
      <Form form={f}>
        <Fieldset legend={t('app.nouns.form.id.fieldset')}>
          <NumberInput
            name='id'
            label={t('app.nouns.form.id.label')}
            disabled
            {...f.getInputProps('id')} />
        </Fieldset>
        <Fieldset legend={t('app.nouns.form.noun.fieldset')} className='gap-4 flex flex-col'>
          <Select
            name='scope'
            label={t('app.nouns.form.scope.label')}
            data={[
              { value: 'all', label: t('app.nouns.form.scope.data.all') },
              { value: 'book', label: t('app.nouns.form.scope.data.book'), disabled: !isPremium },
              { value: 'clipping', label: t('app.nouns.form.scope.data.clipping'), disabled: !isPremium },
              { value: 'forbid', label: t('app.nouns.form.scope.data.forbid'), disabled: !isGrandAdmin },
            ]}
            {...f.getInputProps('scope')}
          />
          <TextInput
            name='noun'
            label={t('app.nouns.form.noun.label')}
            placeholder={t('app.nouns.form.noun.placeholder')}
            disabled
            {...f.getInputProps('noun')}
          />
          <Textarea
            label={t('app.nouns.form.content.label')}
            name='content'
            cols={8}
            rows={10}
            placeholder={t('app.nouns.form.content.placeholder')}
            {...f.getInputProps('content')}
          />
        </Fieldset>
        <Divider className='my-8' />
        <div className='flex justify-end gap-4'>
          <Button
            variant='outline'
            onClick={() => {
              onClose()
              f.reset()
            }}
          >
            {t('app.nouns.form.cancel')}
          </Button>

          <Button
            loading={createLoading || updateLoading}
            onClick={() => {
              if (f.validate().hasErrors) {
                return
              }
              if (id === -1) {
                toast.promise(
                  createNoun({
                    variables: {
                      input: {
                        noun: f.values.noun!,
                        content: f.values.content,
                        scope: f.values.scope as NounScope
                      }
                    }
                  }),
                  toastPromiseDefaultOption
                )
              } else {
                toast.promise(
                  updateNoun({
                    variables: {
                      id,
                      input: {
                        content: f.values.content,
                        scope: f.values.scope as NounScope
                      }
                    }
                  }),
                  toastPromiseDefaultOption
                )
              }
            }}
          >
            {t('app.nouns.form.submit')}
          </Button>
        </div>
      </Form>
    </div>
  )
}

export default NounEditContent
