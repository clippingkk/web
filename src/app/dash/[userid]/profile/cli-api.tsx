'use client'
import Modal from '@annatarhe/lake-ui/modal'
import Tooltip from '@annatarhe/lake-ui/tooltip'
import { useMutation } from '@apollo/client/react'
import { Clipboard, ExternalLink, RefreshCw, Terminal } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import Button from '@/components/button/button'
import CodeHighlight from '@/components/highlighter/client'
import {
  ClaimCliApiTokenDocument,
  type ClaimCliApiTokenMutation,
} from '@/gql/graphql'
import { useTranslation } from '@/i18n/client'
import { getLocalToken } from '@/services/ajax'

function CliApiToken() {
  const { t } = useTranslation()
  const [doClaim, { data, loading }] = useMutation<ClaimCliApiTokenMutation>(
    ClaimCliApiTokenDocument
  )
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!visible) {
      return
    }
    const t = getLocalToken()
    // impossible. just tell the compiler
    if (!t) {
      return
    }
    doClaim({
      variables: {
        token: t,
      },
    })
  }, [visible, doClaim])

  const cliScriptExample = useMemo(() => {
    const k = data?.claimAPIKey
    if (!k) {
      return ''
    }

    return `
ck-cli 
  --token="${k}" 
  parse
  --input My Clippings.txt
  --output http`
  }, [data?.claimAPIKey])

  const onCopyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(cliScriptExample)
    toast.success('paste to terminal')
  }, [cliScriptExample])

  return (
    <div>
      <Tooltip content={t('CLI')}>
        <Button
          onClick={() => setVisible(true)}
          variant='ghost'
          className='hover:bg-gray-100 dark:hover:bg-gray-800'
        >
          <Terminal className='h-5 w-5' strokeWidth={2.5} />
        </Button>
      </Tooltip>
      <Modal
        isOpen={visible}
        onClose={() => setVisible(false)}
        title={
          <div className='flex items-center gap-2'>
            <Terminal className='h-5 w-5' strokeWidth={2.5} />
            {t('CLI API Token')}
          </div>
        }
      >
        <div
          className='space-y-6 rounded-lg bg-white/90 p-6 shadow-xl backdrop-blur-sm dark:bg-gray-800/90'
          onClickCapture={(e) => e.preventDefault()}
        >
          {loading ? (
            <div className='flex items-center justify-center py-10'>
              <RefreshCw className='text-primary-500 h-8 w-8 animate-spin' />
            </div>
          ) : (
            <div className='space-y-8'>
              <div className='space-y-3'>
                <h3 className='flex items-center gap-2 text-xl font-bold'>
                  <span className='bg-primary-500 inline-flex h-8 w-8 items-center justify-center rounded-full text-white'>
                    1
                  </span>
                  {t('Download CLI')}
                </h3>
                <div className='pl-10'>
                  <a
                    href='https://github.com/clippingkk/cli/releases'
                    target='_blank'
                    className='text-primary-600 dark:text-primary-400 inline-flex items-center gap-2 font-medium hover:underline'
                    rel='noreferrer'
                  >
                    clippingkk/cli <ExternalLink className='h-4 w-4' />
                  </a>
                  <p className='mt-1 text-sm text-gray-600 dark:text-gray-300'>
                    {t('Download and set the CLI executable on your system')}
                  </p>
                </div>
              </div>

              <div className='space-y-3'>
                <h3 className='flex items-center gap-2 text-xl font-bold'>
                  <span className='bg-primary-500 inline-flex h-8 w-8 items-center justify-center rounded-full text-white'>
                    2
                  </span>
                  {t('Run Command')}
                </h3>
                <div className='w-full pl-10'>
                  <div className='overflow-hidden rounded-lg bg-gray-900 dark:bg-black'>
                    <CodeHighlight code={cliScriptExample} lang='bash' />
                  </div>
                  <button
                    onClick={onCopyToClipboard}
                    className='bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 mt-3 flex transform items-center gap-2 rounded-md px-4 py-2 font-medium text-white transition-all hover:scale-105'
                    disabled={!data?.claimAPIKey}
                  >
                    <Clipboard className='h-4 w-4' />
                    {t('Copy to Clipboard')}
                  </button>
                </div>
              </div>

              <div className='space-y-3'>
                <h3 className='flex items-center gap-2 text-xl font-bold'>
                  <span className='bg-primary-500 inline-flex h-8 w-8 items-center justify-center rounded-full text-white'>
                    3
                  </span>
                  {t('Refresh and Sync')}
                </h3>
                <div className='pl-10'>
                  <p className='text-gray-700 dark:text-gray-200'>
                    {t(
                      'After running the command, refresh the page and wait for your clippings to sync'
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default CliApiToken
