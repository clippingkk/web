'use client'
import Modal from '@annatarhe/lake-ui/modal'
import { ExternalLink, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Streamdown } from 'streamdown'

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
        className="group ml-4 inline-flex items-center gap-2 rounded-lg border border-white/40 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-slate-800/40 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-900/90"
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
            <Streamdown components={MarkdownComponents}>
              {personalityData}
            </Streamdown>
          )}
          {error && (
            <div className="mt-4 w-full rounded-xl border border-rose-400/20 bg-rose-400/10 p-4 text-rose-600 dark:text-rose-300">
              <h3 className="mb-2 font-semibold">Error</h3>
              <p>{error.message}</p>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}

export default PersonalityView
