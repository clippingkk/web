import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid'
import ReactMarkdown from 'react-markdown'
import CodeBlock from '@/components/highlighter/client'

type MarkdownPreviewProps = {
  value: string
}

function MarkdownPreview(props: MarkdownPreviewProps) {
  const { value } = props
  return (
    <div className="text-lg">
      <ReactMarkdown
        components={{
          h1: ({ className, ref, ...props }) => (
            <h1 className={`my-6 text-4xl font-bold ${className}`} {...props} />
          ),
          h2: ({ className, ref, ...props }) => (
            <h2 className={`my-5 text-3xl font-bold ${className}`} {...props} />
          ),
          h3: ({ className, ref, ...props }) => (
            <h3 className={`my-4 text-2xl font-bold ${className}`} {...props} />
          ),
          h4: ({ className, ref, ...props }) => (
            <h4 className={`my-3 text-xl font-bold ${className}`} {...props} />
          ),
          h5: ({ className, ref, ...props }) => (
            <h5 className={`my-2 text-lg font-bold ${className}`} {...props} />
          ),
          h6: ({ className, ref, ...props }) => (
            <h6
              className={`my-1 text-base font-bold ${className}`}
              {...props}
            />
          ),
          ul: ({ ref, ...props }) => (
            <ul className="list-disc pl-4" {...props} />
          ),
          ol: ({ type, ref, ...props }) => (
            <ol className="list-decimal pl-4" {...props} />
          ),
          li: ({ className, ref, ...props }) => (
            <li className={`list-item text-lg ${className}`} {...props} />
          ),
          p: ({ ref, ...props }) => (
            <p
              className={'my-2 leading-relaxed ' + props.className}
              {...props}
            />
          ),
          a: ({ className, children, ...props }) => {
            return (
              <a
                target="_blank"
                className={`relative text-lg ${className} hover:underline`}
                {...props}
              >
                {children}
                <ArrowTopRightOnSquareIcon className="absolute top-0 -right-4 ml-2 inline-block h-4 w-4" />
              </a>
            )
          },
          code: (props) => {
            const { className, children } = props
            const match = /language-(\w+)/.exec(className || '')
            const lang = match ? match[1] : 'tsx'
            return (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <CodeBlock code={String(children)} lang={lang as any} />
            )
          },
          blockquote: ({ className, children, ref, ...props }) => (
            <blockquote
              className={`my-4 border-l-4 border-gray-300 bg-gray-50 py-2 pl-4 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 ${className}`}
              {...props}
            >
              {children}
            </blockquote>
          ),
        }}
        skipHtml
      >
        {value}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownPreview
