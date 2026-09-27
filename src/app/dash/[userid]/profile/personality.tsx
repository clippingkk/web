'use client'

import Button from '@annatarhe/lake-ui/button'
import Modal from '@annatarhe/lake-ui/modal'
import Spinner from '@annatarhe/lake-ui/spinner'
import { useQuery } from '@apollo/client/react'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Streamdown } from 'streamdown'

import { MarkdownComponents } from '@/components/RichTextEditor/markdown-components'
import { FetchUserPersonalityDocument } from '@/gql/graphql'
import { useTranslation } from '@/i18n/client'

type PersonalityViewProps = {
  uid: number
}

/** Premium: an AI portrait of the owner's reading, from their highlights. */
function PersonalityView({ uid }: PersonalityViewProps) {
  const { t } = useTranslation(undefined, 'profile')
  const [open, setOpen] = useState(false)
  const { data, loading, error } = useQuery(FetchUserPersonalityDocument, {
    variables: { id: uid },
    skip: !open,
  })
  const text = data?.me.personalityByAI

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        leadingIcon={<Sparkles className="size-4" />}
        onClick={() => setOpen(true)}
      >
        {t('personality.open')}
      </Button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={t('personality.title')}
        size="lg"
      >
        <div aria-live="polite" className="min-h-40">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <Spinner size="md" />
              <p className="type-meta">{t('personality.loading')}</p>
            </div>
          ) : error ? (
            <p className="text-lake-danger text-sm">
              {error.message || t('personality.failed')}
            </p>
          ) : text ? (
            <div className="text-lake-fg text-[0.9375rem] leading-relaxed">
              <Streamdown components={MarkdownComponents}>{text}</Streamdown>
            </div>
          ) : null}
        </div>
      </Modal>
    </>
  )
}

export default PersonalityView
