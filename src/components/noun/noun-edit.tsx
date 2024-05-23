import React, { useEffect } from 'react'
import { Form, useForm, zodResolver } from '@mantine/form'
import { FetchClippingQuery, Noun, NounScope, useCreateNounMutationMutation, useUpdateNounMutationMutation } from '../../schema/generated'
import { z } from 'zod'
import { Button, Divider, Fieldset, NumberInput, TextInput, Textarea } from '@mantine/core'
import { useTranslation } from 'react-i18next'

type NounEditContentProps = {
  id: -1 | number
  noun?: FetchClippingQuery['clipping']['richContent']['nouns'][0]
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

function NounEditContent(props: NounEditContentProps) {
  const { id, noun, onClose } = props

  const [createNoun] = useCreateNounMutationMutation()
  const [updateNoun] = useUpdateNounMutationMutation()

  const f = useForm<formType>({
    validate: zodResolver(schema),
    initialValues: {
      id,
      noun: noun?.noun,
      content: noun?.content,
      bookId: noun?.bookId,
      scope: NounScope.All,
    }
  })

  useEffect(() => {
    return () => {
      f.reset()
    }
  }, [])

  const [t] = useTranslation()

  if (!id) {
    return null
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
          <TextInput
            name='noun'
            placeholder={t('app.nouns.form.noun.placeholder')}
            {...f.getInputProps('noun')}
          />
          <Textarea
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
            onClick={() => {
              if (f.validate().hasErrors) {
                return
              }
              if (id === -1) {
                createNoun({
                  variables: {
                    input: {
                      noun: f.values.noun!,
                      content: f.values.content,
                      scope: f.values.scope as NounScope
                    }
                  }
                })
              } else {
                updateNoun({
                  variables: {
                    id,
                    input: {
                      content: f.values.content,
                      scope: f.values.scope as NounScope
                    }
                  }
                })
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
