'use client'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import Modal from '@annatarhe/lake-ui/modal'
import { CodeHighlight } from '@mantine/code-highlight'
import { getLocalToken } from '@/services/ajax'
import { useClaimCliApiTokenMutation } from '@/schema/generated'
import Button from '@/components/button'
import Tooltip from '@annatarhe/lake-ui/tooltip'
import { Terminal, Clipboard, ExternalLink, RefreshCw } from 'lucide-react'
import { useTranslation } from '@/i18n/client'

function CliApiToken() {
  const { t } = useTranslation()
  const [doClaim, { data, loading }] = useClaimCliApiTokenMutation()
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
        token: t
      }
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
  --input My\ Clippings.txt
  --output http`
  }, [data?.claimAPIKey])

  const onCopyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(cliScriptExample)
    toast.success('paste to terminal')
  }, [cliScriptExample])

  return (
    <div>
      <Tooltip
        content={t('CLI')}
      >
        <Button
          onClick={() => setVisible(true)}
          variant='ghost'
          className="hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Terminal className="w-5 h-5" strokeWidth={2.5} />
        </Button>
      </Tooltip>
      <Modal
        isOpen={visible}
        onClose={() => setVisible(false)}
        title={(
          <div className='flex items-center gap-2'>
            <Terminal className="w-5 h-5" strokeWidth={2.5} />
            {t('CLI API Token')}
          </div>
        )}
      >
        <div 
          className="p-6 space-y-6 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-xl"
          onClickCapture={e => e.preventDefault()}
        >
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : (
            <div className="space-y-8">
              <div className="space-y-3">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="inline-flex justify-center items-center w-8 h-8 rounded-full bg-primary-500 text-white">1</span>
                  {t('Download CLI')}
                </h3>
                <div className="pl-10">
                  <a
                    href="https://github.com/clippingkk/cli/releases"
                    target="_blank"
                    className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline font-medium"
                    rel="noreferrer"
                  >
                    clippingkk/cli <ExternalLink className="w-4 h-4" />
                  </a>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {t('Download and set the CLI executable on your system')}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="inline-flex justify-center items-center w-8 h-8 rounded-full bg-primary-500 text-white">2</span>
                  {t('Run Command')}
                </h3>
                <div className="pl-10 w-full">
                  <div className="bg-gray-900 dark:bg-black rounded-lg overflow-hidden">
                    <CodeHighlight code={cliScriptExample} language="bash" />
                  </div>
                  <button
                    onClick={onCopyToClipboard}
                    className="mt-3 flex items-center gap-2 px-4 py-2 rounded-md bg-primary-500 text-white hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 transition-all transform hover:scale-105 font-medium"
                    disabled={!data?.claimAPIKey}
                  >
                    <Clipboard className="w-4 h-4" />
                    {t('Copy to Clipboard')}
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="inline-flex justify-center items-center w-8 h-8 rounded-full bg-primary-500 text-white">3</span>
                  {t('Refresh and Sync')}
                </h3>
                <div className="pl-10">
                  <p className="text-gray-700 dark:text-gray-200">
                    {t('After running the command, refresh the page and wait for your clippings to sync')}
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
