'use client'
import Modal from '@annatarhe/lake-ui/modal'
import { ExternalLink, Loader2 } from 'lucide-react'
import { useState } from 'react'
import Markdown from 'react-markdown'
import { MarkdownComponents } from '@/components/RichTextEditor/markdown-components'
import { useTranslation } from '@/i18n/client'
import { useFetchUserPersonalityQuery } from '@/schema/generated'

type PersonalityViewProps = {
  uid?: number
  domain?: string
}

function PersonalityView(props: PersonalityViewProps) {
  const { uid, domain } = props
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)

  const { data, loading, error } = useFetchUserPersonalityQuery({
    variables: {
      id: uid,
      domain,
    },
    skip: !isOpen,
  })

  const personalityData = data?.me.personalityByAI

  return (
    <>
      <button
        onClick={open}
        className="group ml-4 inline-flex items-center gap-2 rounded-lg bg-linear-to-br from-white/10 to-white/5 px-4 py-2 text-sm font-medium text-gray-900 shadow-lg backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:from-white/20 hover:to-white/10 dark:text-white"
        title={t('app.profile.personality.tooltip') ?? ''}
      >
        <ExternalLink className="h-4 w-4 transition-transform group-hover:rotate-12" />
        {t('app.profile.personality.title')}
      </button>

      <Modal
        isOpen={isOpen}
        onClose={close}
        title={t('app.profile.personality.title')}
      >
        <div className="relative flex max-h-[80vh] min-h-[240px] w-full flex-col overflow-y-auto p-4 px-4">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-xs">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
          )}
          {personalityData && (
            <Markdown components={MarkdownComponents}>
              {personalityData}
            </Markdown>
          )}
          {error && (
            <div className="mt-4 w-full rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-600 dark:text-red-400">
              <h3 className="mb-2 font-semibold">Error</h3>
              <p>
                {error.clientErrors.map((e) => e.message).join(', ')}
                {error.networkError?.message}
                {error.graphQLErrors.map((e) => e.message).join(', ')}
              </p>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}

export default PersonalityView
