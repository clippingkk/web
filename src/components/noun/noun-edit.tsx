import React from 'react'
import { Form, useForm, zodResolver } from '@mantine/form'
import { Noun, NounScope, useCreateNounMutationMutation, useUpdateNounMutationMutation } from '../../schema/generated'
import { z } from 'zod'
import { Fieldset, NumberInput, TextInput, Textarea } from '@mantine/core'
import { useTranslation } from 'react-i18next'

type NounEditContentProps = {
  id?: -1 | number
  noun?: string
}

const schema = z.object({
  id: z.number().nullable(),
  noun: z.string().max(100).readonly(),
  content: z.string().max(10000),
  bookId: z.string().nullable(),
  clippingId: z.number().nullable(),
  scope: z.enum(['all', 'book', 'clipping', 'forbid']),
})

function NounEditContent(props: NounEditContentProps) {
  const { id, noun } = props

  const [createNoun] = useCreateNounMutationMutation()
  const [updateNoun] = useUpdateNounMutationMutation()

  const f = useForm({
    validate: zodResolver(schema),
    initialValues: {
      noun: noun,
      scope: NounScope.All,
    }
  })

  const [t] = useTranslation()


  if (!id || !noun) {
    return null
  }
  return (
    <div>
      <Form form={f}>
        <Fieldset legend={t('app.nouns.form.id.fieldset')}>
          <NumberInput name='id' />
        </Fieldset>
        <Fieldset legend={t('app.nouns.form.noun.fieldset')}>
          <TextInput name='noun' />

          <Textarea name='content' />
        </Fieldset>
      </Form>
    </div>
  )
}

export default NounEditContent
