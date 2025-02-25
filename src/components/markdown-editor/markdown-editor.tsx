import { DocumentTextIcon, PencilSquareIcon } from '@heroicons/react/24/solid'
import { Tabs, Text, Textarea } from '@mantine/core'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import { useTranslation } from 'react-i18next'
import MarkdownPreview from './md-preview'

type MarkdownEditorProps = {
  value: string
  onValueChange: (v: string) => void
}

function MarkdownEditor(props: MarkdownEditorProps) {
  const { t } = useTranslation()
  const { value, onValueChange } = props

  return (
    <Tabs defaultValue={'edit'}>
      <Tabs.List>
        <Tabs.Tab
          leftSection={<PencilSquareIcon className='w-4 h-4' />}
          value='edit'
        >
          <Text>Edit</Text>
        </Tabs.Tab>
        <Tabs.Tab
          leftSection={<DocumentTextIcon className='w-4 h-4' />}
          value='preview'
        >
          <Text>Preview</Text>
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="edit" pt="xs">
        <Textarea
          minRows={8}
          className='bg-gray-100 dark:bg-gray-900 bg-opacity-90 rounded-sm'
          autosize
          maxRows={30}
          size='lg'
          value={value}
          onChange={e => onValueChange(e.target.value)}
          placeholder={t('app.clipping.comments.placeholder') ?? ''}
        />
      </Tabs.Panel>
      <Tabs.Panel value="preview" pt="xs">
        <div className='p-4 bg-gray-100 bg-opacity-90 rounded-sm min-h-[184px]'>
          <MarkdownPreview value={value} />
        </div>
      </Tabs.Panel>
    </Tabs>
  )
}

export default MarkdownEditor
