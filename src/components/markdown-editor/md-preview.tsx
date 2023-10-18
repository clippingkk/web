import React from 'react'
import { List, Title, Text, Blockquote } from '@mantine/core'
import ReactMarkdown from 'react-markdown'
import { CodeHighlight } from '@mantine/code-highlight';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid'

type MarkdownPreviewProps = {
  value: string
}

function MarkdownPreview(props: MarkdownPreviewProps) {
  const { value } = props
  return (
    <div className=' text-lg'>
      <ReactMarkdown
        components={{
          h1: ({ className, ...props }) => <Title order={1} className={`my-6 ${className}`} {...props} />,
          h2: ({ className, ...props }) => <Title order={2} className={`my-5 ${className}`} {...props} />,
          h3: ({ className, ...props }) => <Title order={3} className={`my-4 ${className}`} {...props} />,
          h4: ({ className, ...props }) => <Title order={4} className={`my-3 ${className}`} {...props} />,
          h5: ({ className, ...props }) => <Title order={5} className={`my-2 ${className}`} {...props} />,
          h6: ({ className, ...props }) => <Title order={6} className={`my-1 ${className}`} {...props} />,
          ul: (props) => <List listStyleType='disc' {...props} />,
          ol: ({ type, ...props }) => <List listStyleType='ordered' {...props} />,
          li: ({ className, ...props}) => <List.Item className={` text-lg ${className}`} {...props} />,
          p: (props) => <Text {...props} />,
          a: ({ className, children, ...props }) => {
            return (
              <a target='_blank' className={`relative text-lg ${className} hover:underline`} {...props}>
                {children}
                <ArrowTopRightOnSquareIcon className='absolute top-0 -right-4 ml-2 h-4 w-4 inline-block' />
              </a>
            )
          },
          code: (props) => {
            const { className, children } = props
            const match = /language-(\w+)/.exec(className || '')
            const lang = match ? match[1] : 'tsx'
            return (
              <CodeHighlight code={String(children)} language={lang as any} className='my-4' />
            )
          },
          blockquote: ({ className, children, ...props }) => (
            <Blockquote className={`my-4 ${className}`} {...props}>
              {children}
            </Blockquote>
          )
        }}
        skipHtml
      >
        {value}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownPreview
