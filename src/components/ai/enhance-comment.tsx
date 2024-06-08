import { Button, LoadingOverlay, Modal } from '@mantine/core'
import { useAiEnhanceCommentMutation } from '../../schema/generated'
import React, { useCallback, useState } from 'react'
import MarkdownPreview from '../markdown-editor/md-preview'
import { toast } from 'react-hot-toast'

type AICommentEnhancerProps = {
  bookName?: string
  clippingId: number
  comment: string
  onAccept: (nt: string) => void
}

enum Prompts {
  Professional = 1,
  Deeper = 2,
  Intriguing = 3,
}

function AICommentEnhancer(props: AICommentEnhancerProps) {

  const [opened, setOpened] = useState(false)
  const [doEnhance, { loading, data }] = useAiEnhanceCommentMutation({
    variables: {
      promptId: -1,
      bookName: props.bookName,
      clippingId: props.clippingId,
      content: props.comment,
    },
    onCompleted() {
      toast.success('Got an AI improved comment!')
      setOpened(true)
    }
  })

  const onEnhance = useCallback((promptId: Prompts) => {
    return doEnhance({
      variables: {
        promptId: promptId,
        bookName: props.bookName,
        clippingId: props.clippingId,
        content: props.comment,
      }
    })
  }, [doEnhance, props.bookName, props.clippingId, props.comment])

  return (
    <>
      <Button.Group className='gap-2'>
        <Button
          variant="gradient"
          className='bg-gradient-to-r from-gray-500 to-pink-400'
          loading={loading}
          onClick={() => onEnhance(Prompts.Professional)}
        >
          Make it Professional
        </Button>
        <Button
          variant="gradient"
          className='bg-gradient-to-r from-pink-400 to-green-500'
          loading={loading}
          onClick={() => onEnhance(Prompts.Deeper)}
        >
          Make it deeper
        </Button>
        <Button
          variant="gradient"
          className='bg-gradient-to-r from-green-500 to-sky-400'
          loading={loading}
          onClick={() => onEnhance(Prompts.Intriguing)}
        >
          Make it more intriguing
        </Button>
      </Button.Group>
      <Modal
        opened={opened || loading}
        onClose={() => setOpened(false)}
        title="Enhanced Comment"
        size="lg"
        centered>
        <LoadingOverlay
          visible={loading}
        />
        <MarkdownPreview
          value={data?.aiEnhanceComment.content ?? '## Loading'}
        />
        <div className='flex justify-end w-full '>
          <Button
            onClick={() => setOpened(false)}
            className='bg-gray-300 text-black mr-4'
          >
            Cancel
          </Button>
          <Button
            variant='gradient'
            className='bg-gradient-to-br from-green-300 to-pink-400 text-black'
            onClick={() => {
              setOpened(false)
              props.onAccept(data?.aiEnhanceComment.content ?? '')
            }}>
            Accept
          </Button>
        </div>
      </Modal>
    </>
  )
}

export default AICommentEnhancer
