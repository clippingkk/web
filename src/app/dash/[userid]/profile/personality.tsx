'use client'
import { ExternalLink, Loader2 } from 'lucide-react'
import { useTranslation } from '@/i18n/client'
import { useFetchUserPersonalityQuery } from '@/schema/generated'
import Modal from '@annatarhe/lake-ui/modal'
import { useState } from 'react'
import Markdown from 'react-markdown'
import { MarkdownComponents } from '@/components/RichTextEditor/markdown-components'

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
      domain
    },
    skip: !isOpen
  })

  const personalityData = data?.me.personalityByAI

  return (
    <>
      <button
        onClick={open}
        className='group inline-flex items-center gap-2 ml-4 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white bg-linear-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 rounded-lg shadow-lg backdrop-blur-xl transition-all duration-300 hover:scale-105'
        title={t('app.profile.personality.tooltip') ?? ''}
      >
        <ExternalLink className='w-4 h-4 transition-transform group-hover:rotate-12' />
        {t('app.profile.personality.title')}
      </button>

      <Modal
        isOpen={isOpen}
        onClose={close}
        title={t('app.profile.personality.title')}
      >
        <div className='w-full min-h-[240px] flex items-center flex-col px-4 relative'>
          {loading && (
            <div className='absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-xs'>
              <Loader2 className='w-8 h-8 animate-spin text-primary' />
            </div>
          )}
          {personalityData && (
            <Markdown components={MarkdownComponents}>
              {personalityData}
            </Markdown>
          )}
          {error && (
            <div className='w-full p-4 mt-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400'>
              <h3 className='font-semibold mb-2'>Error</h3>
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
