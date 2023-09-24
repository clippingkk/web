import { Blockquote, LoadingOverlay, Modal, Paper, Tooltip, useMantineTheme } from '@mantine/core'
import { useViewportSize } from '@mantine/hooks';
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useFetchClippingAiSummaryQuery } from '../../schema/generated'

type ClippingAISummaryModalProps = {
  cid?: number
  open: boolean
  onClose: () => void
}

type serverGraphQLError = {
  name: string, result: {
    errors: {
      message: string,
      path: string[],
      extensions: {
        code: number,
        message: string
      }
    }[]
  }
}

function ClippingAISummaryModal(props: ClippingAISummaryModalProps) {
  const { cid, open, onClose } = props
  const theme = useMantineTheme()

  const { data, loading, error } = useFetchClippingAiSummaryQuery({
    variables: {
      id: cid ?? 0
    },
    skip: !open && !!cid
  })

  const isMobile = useViewportSize().width <= 768

  const { t } = useTranslation()

  const errMsg = useMemo(() => {
    if (!error) {
      return null
    }

    const ne = error.networkError as unknown as serverGraphQLError

    const errs = ne.result.errors
    if (errs.length === 0) {
      return error.message
    }

    return errs[0].message
  }, [error])

  return (
    <Modal
      opened={open}
      onClose={onClose}
      centered
      size='auto'
      title={t('app.clipping.aiSummary')}
      overlayProps={{
        blur: 10,
        opacity: 0.7
      }}
    >
      <div className='relative'>
        <LoadingOverlay
          visible={loading}
        />
        <Tooltip
          label={errMsg?.includes('402') ? t('app.payment.required') : t('app.ai.clippingHelp')}
        >
          <Paper className='w-96 md:w-144 lg:w-[600px]'>
            <Blockquote icon={isMobile ? null : undefined} cite=' - ChatGPT' className='font-lxgw'>
              {errMsg ?? data?.clipping.aiSummary}
            </Blockquote>
          </Paper>
        </Tooltip>
      </div>
    </Modal>
  )
}

export default ClippingAISummaryModal
