import { CommandLineIcon } from '@heroicons/react/24/outline'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import Dialog from '../../../../components/dialog/dialog'
import { CodeHighlight } from '@mantine/code-highlight';
import { getLocalToken } from '../../../../services/ajax'
import { useClaimCliApiTokenMutation } from '../../../../schema/generated'
import { Button, Tooltip } from '@mantine/core';

type CliApiTokenProps = {
}

function CliApiToken(props: CliApiTokenProps) {
  const [doClaim, { data }] = useClaimCliApiTokenMutation()
  // TODO: request publick api token
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
        label={'CLI'}
        withArrow
        transitionProps={{ transition: 'pop', duration: 200 }}
      >
        <Button
          onClick={() => {
            setVisible(true)
          }}
          bg={'transparent'}
        >
          <CommandLineIcon className='w-6 h-6' />
        </Button>
      </Tooltip>
      {visible && (
        <Dialog
          onCancel={() => {
            setVisible(false)
          }}
          onOk={() => {
            setVisible(false)
          }}
          title='cli api token'
        >
          <div
            className='container text-3xl leading-loose'
            onClickCapture={e => e.preventDefault()}
          >
            1. download cli and set it executable:
            <a
              href="https://github.com/clippingkk/cli/releases"
              target='_blank'
              className='ml-4 underline text-2xl'
              rel="noreferrer"
            >
              clippingkk/cli
            </a>
            <br />
            2. run
            <CodeHighlight code={cliScriptExample} language='bash' />
            <button
              onClick={onCopyToClipboard}
              className='text-xl py-2 px-4 rounded bg-blue-500 text-white hover:scale-110 transform duration-300'
            >Copy to Clipboard</button>
            <br />
            3. refresh and wait it sync
          </div>
        </Dialog>
      )}
    </div>
  )
}

export default CliApiToken
