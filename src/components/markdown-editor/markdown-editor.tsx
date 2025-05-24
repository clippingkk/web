import { useTranslation } from '@/i18n/client'
import { DocumentTextIcon, PencilSquareIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'
import MarkdownPreview from './md-preview'

type MarkdownEditorProps = {
  value: string
  onValueChange: (v: string) => void
}

function MarkdownEditor(props: MarkdownEditorProps) {
  const { t } = useTranslation()
  const { value, onValueChange } = props
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')

  return (
    <div className="w-full">
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setActiveTab('edit')}
          className={`flex items-center px-4 py-2 text-sm font-medium ${
            activeTab === 'edit'
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <PencilSquareIcon className="mr-2 h-4 w-4" />
          <span>{t('common.edit') || 'Edit'}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex items-center px-4 py-2 text-sm font-medium ${
            activeTab === 'preview'
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <DocumentTextIcon className="mr-2 h-4 w-4" />
          <span>{t('common.preview') || 'Preview'}</span>
        </button>
      </div>

      <div className="mt-2">
        {activeTab === 'edit' ? (
          <div className="relative">
            <textarea
              rows={8}
              className="bg-opacity-90 dark:bg-opacity-90 block w-full rounded-md border-gray-300 bg-gray-100 p-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              value={value}
              onChange={(e) => onValueChange(e.target.value)}
              placeholder={t('app.clipping.comments.placeholder') ?? ''}
              style={{
                minHeight: '184px',
                resize: 'vertical',
              }}
            />
          </div>
        ) : (
          <div className="bg-opacity-90 dark:bg-opacity-90 min-h-[184px] rounded-md bg-gray-100 p-4 dark:bg-gray-800">
            <MarkdownPreview value={value} />
          </div>
        )}
      </div>
    </div>
  )
}

export default MarkdownEditor
