import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid'
import { Streamdown } from 'streamdown'
import CodeBlock from '@/components/highlighter/client'

type MarkdownPreviewProps = {
  value: string
}

function MarkdownPreview(props: MarkdownPreviewProps) {
  const { value } = props
  return (
    <div className='text-lg'>
      <Streamdown
        components={{
          h1: ({ className, ...props }) => (
            <h1 className={`my-6 text-4xl font-bold ${className}`} {...props} />
          ),
          h2: ({ className, ...props }) => (
            <h2 className={`my-5 text-3xl font-bold ${className}`} {...props} />
          ),
          h3: ({ className, ...props }) => (
            <h3 className={`my-4 text-2xl font-bold ${className}`} {...props} />
          ),
          h4: ({ className, ...props }) => (
            <h4 className={`my-3 text-xl font-bold ${className}`} {...props} />
          ),
          h5: ({ className, ...props }) => (
            <h5 className={`my-2 text-lg font-bold ${className}`} {...props} />
          ),
          h6: ({ className, ...props }) => (
            <h6
              className={`my-1 text-base font-bold ${className}`}
              {...props}
            />
          ),
          ul: ({ ...props }) => <ul className='list-disc pl-4' {...props} />,
          ol: ({ ...props }) => <ol className='list-decimal pl-4' {...props} />,
          li: ({ className, ...props }) => (
            <li className={`list-item text-lg ${className}`} {...props} />
          ),
          p: ({ ...props }) => (
            <p
              className={`my-2 leading-relaxed ${props.className}`}
              {...props}
            />
          ),
          a: ({ className, children, ...props }) => {
            return (
              <a
                target='_blank'
                className={`relative text-lg ${className} hover:underline`}
                {...props}
              >
                {children}
                <ArrowTopRightOnSquareIcon className='absolute top-0 -right-4 ml-2 inline-block h-4 w-4' />
              </a>
            )
          },
          code: (props) => {
            const { className, children } = props
            const match = /language-(\w+)/.exec(className || '')
            const lang = match ? match[1] : 'tsx'
            return (
               
              <CodeBlock code={String(children)} lang={lang as any} />
            )
          },
          blockquote: ({ className, children, ...props }) => (
            <blockquote
              className={`my-4 border-l-4 border-gray-300 bg-gray-50 py-2 pl-4 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 ${className}`}
              {...props}
            >
              {children}
            </blockquote>
          ),
        }}
      >
        {value}
      </Streamdown>
    </div>
  )
}

export default MarkdownPreview
