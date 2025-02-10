import { Components } from 'react-markdown'
import { cn } from '@/lib/utils'

type HeadingProps = {
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: React.ReactNode
}

const Heading = ({ level, children }: HeadingProps) => {
  const className = cn(
    'font-bold tracking-tight',
    level === 1 && 'mb-8 bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-4xl text-transparent dark:from-gray-100 dark:to-gray-400',
    level === 2 && 'mb-6 bg-gradient-to-br from-gray-800 to-gray-600 bg-clip-text text-3xl text-transparent dark:from-gray-200 dark:to-gray-400',
    level === 3 && 'mb-4 text-2xl text-gray-800 dark:text-gray-200',
    level === 4 && 'mb-4 text-xl text-gray-800 dark:text-gray-200',
    level === 5 && 'mb-4 text-lg text-gray-800 dark:text-gray-200',
    level === 6 && 'mb-4 text-base text-gray-800 dark:text-gray-200'
  )

  const Tag = `h${level}` as keyof JSX.IntrinsicElements
  return <Tag className={className}>{children}</Tag>
}

export const MarkdownComponents: Components = {
  h1: ({ children }) => <Heading level={1}>{children}</Heading>,
  h2: ({ children }) => <Heading level={2}>{children}</Heading>,
  h3: ({ children }) => <Heading level={3}>{children}</Heading>,
  h4: ({ children }) => <Heading level={4}>{children}</Heading>,
  h5: ({ children }) => <Heading level={5}>{children}</Heading>,
  h6: ({ children }) => <Heading level={6}>{children}</Heading>,
  p: ({ children }) => (
    <p className='mb-6 leading-7 text-gray-700 dark:text-gray-300 [&:not(:first-child)]:mt-6'>
      {children}
    </p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className='bg-gradient-to-r from-blue-600 to-blue-400 bg-[length:0%_2px] bg-left-bottom bg-no-repeat px-1 text-blue-600 transition-all hover:bg-[length:100%_2px] hover:text-blue-500 dark:from-blue-400 dark:to-blue-300 dark:text-blue-400 dark:hover:text-blue-300'
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className='font-bold text-gray-900 dark:text-white'>{children}</strong>
  ),
  em: ({ children }) => (
    <em className='italic text-gray-800 dark:text-gray-200'>{children}</em>
  ),
  code: ({ children }) => (
    <code className='rounded-md bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-gray-900 dark:bg-gray-800 dark:text-gray-100'>
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className='mb-4 mt-6 overflow-x-auto rounded-lg bg-gray-100 p-4 dark:bg-gray-800/50'>
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className='mt-6 border-l-4 border-gray-300 bg-gradient-to-r from-gray-100 to-transparent pl-6 italic text-gray-700 dark:border-gray-700 dark:from-gray-800 dark:to-transparent dark:text-gray-400'>
      {children}
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul className='my-6 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300 [&>li]:mt-2'>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className='my-6 ml-6 list-decimal space-y-2 text-gray-700 dark:text-gray-300 [&>li]:mt-2'>
      {children}
    </ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  hr: () => <hr className='my-8 border-gray-200 dark:border-gray-800' />,
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt}
      className='my-8 rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-800 dark:bg-gray-900/50'
    />
  ),
  table: ({ children }) => (
    <div className='my-6 w-full overflow-y-auto'>
      <table className='w-full border-collapse text-sm'>{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className='border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50'>
      {children}
    </thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className='border-b border-gray-100 dark:border-gray-800 [&:last-child]:border-0'>
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className='border-r border-gray-100 p-4 text-left font-medium text-gray-900 dark:border-gray-800 dark:text-gray-100 [&:last-child]:border-0'>
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className='border-r border-gray-100 p-4 text-gray-700 dark:border-gray-800 dark:text-gray-300 [&:last-child]:border-0'>
      {children}
    </td>
  ),
}
