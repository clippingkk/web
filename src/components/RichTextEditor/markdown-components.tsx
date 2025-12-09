import type React from 'react'
import { cn } from '@/lib/utils'

type HeadingProps = {
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: React.ReactNode
}

const Heading = ({ level, children }: HeadingProps) => {
  const className = cn(
    'font-bold tracking-tight',
    level === 1 &&
      'mb-8 bg-linear-to-br from-gray-900 to-gray-600 bg-clip-text text-4xl text-transparent dark:from-gray-100 dark:to-gray-400',
    level === 2 &&
      'mb-6 bg-linear-to-br from-gray-800 to-gray-600 bg-clip-text text-3xl text-transparent dark:from-gray-200 dark:to-gray-400',
    level === 3 && 'mb-4 text-2xl text-gray-800 dark:text-gray-200',
    level === 4 && 'mb-4 text-xl text-gray-800 dark:text-gray-200',
    level === 5 && 'mb-4 text-lg text-gray-800 dark:text-gray-200',
    level === 6 && 'mb-4 text-base text-gray-800 dark:text-gray-200'
  )

   
  const Tag = `h${level}` as any
  return <Tag className={className}>{children}</Tag>
}

 
export const MarkdownComponents: any = {
  h1: ({
    children,
    ...props
  }: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLHeadingElement>,
    HTMLHeadingElement
  >) => (
    <Heading level={1} {...props}>
      {children}
    </Heading>
  ),
  h2: ({
    children,
  }: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLHeadingElement>,
    HTMLHeadingElement
  >) => <Heading level={2}>{children}</Heading>,
  h3: ({
    children,
  }: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLHeadingElement>,
    HTMLHeadingElement
  >) => <Heading level={3}>{children}</Heading>,
  h4: ({
    children,
  }: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLHeadingElement>,
    HTMLHeadingElement
  >) => <Heading level={4}>{children}</Heading>,
  h5: ({
    children,
  }: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLHeadingElement>,
    HTMLHeadingElement
  >) => <Heading level={5}>{children}</Heading>,
  h6: ({
    children,
  }: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLHeadingElement>,
    HTMLHeadingElement
  >) => <Heading level={6}>{children}</Heading>,
  p: ({
    children,
    ...props
  }: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLParagraphElement>,
    HTMLParagraphElement
  >) => (
    <p className='mb-6 leading-7 text-gray-700 not-first:mt-6 dark:text-gray-300'>
      {children}
    </p>
  ),
  a: ({
    href,
    children,
    ...props
  }: React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  >) => (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className='bg-linear-to-r from-blue-600 to-blue-400 bg-[length:0%_2px] bg-left-bottom bg-no-repeat px-1 text-blue-600 transition-all hover:bg-[length:100%_2px] hover:text-blue-500 dark:from-blue-400 dark:to-blue-300 dark:text-blue-400 dark:hover:text-blue-300'
      {...props}
    >
      {children}
    </a>
  ),
  strong: ({
    children,
    ...props
  }: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  >) => (
    <strong className='font-bold text-gray-900 dark:text-white' {...props}>
      {children}
    </strong>
  ),
  em: ({
    children,
    ...props
  }: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  >) => (
    <em className='text-gray-800 italic dark:text-gray-200' {...props}>
      {children}
    </em>
  ),
  code: ({
    children,
    ...props
  }: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  >) => (
    <code
      className='rounded-md bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-gray-900 dark:bg-gray-800 dark:text-gray-100'
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({
    children,
    ...props
  }: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLPreElement>,
    HTMLPreElement
  >) => (
    <pre
      className='mt-6 mb-4 overflow-x-auto rounded-lg bg-gray-100 p-4 dark:bg-gray-800/50'
      {...props}
    >
      {children}
    </pre>
  ),
  blockquote: ({
    children,
    ...props
  }: React.DetailedHTMLProps<
    React.BlockquoteHTMLAttributes<HTMLQuoteElement>,
    HTMLQuoteElement
  >) => (
    <blockquote
      className='mt-6 border-l-4 border-gray-300 bg-linear-to-r from-gray-100 to-transparent pl-6 text-gray-700 italic dark:border-gray-700 dark:from-gray-800 dark:to-transparent dark:text-gray-400'
      {...props}
    >
      {children}
    </blockquote>
  ),
  ul: ({
    children,
    ...props
  }: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLUListElement>,
    HTMLUListElement
  >) => (
    <ul
      className='my-6 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300 [&>li]:mt-2'
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({
    children,
    ...props
  }: React.DetailedHTMLProps<
    React.OlHTMLAttributes<HTMLOListElement>,
    HTMLOListElement
  >) => (
    <ol
      className='my-6 ml-6 list-decimal space-y-2 text-gray-700 dark:text-gray-300 [&>li]:mt-2'
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({
    children,
    ...props
  }: React.DetailedHTMLProps<
    React.LiHTMLAttributes<HTMLLIElement>,
    HTMLLIElement
  >) => <li {...props}>{children}</li>,
  hr: (
    props: React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLHRElement>,
      HTMLHRElement
    >
  ) => (
    <hr
      className='my-8 h-1 w-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 opacity-80 shadow-sm backdrop-blur-sm dark:from-indigo-600 dark:via-violet-600 dark:to-purple-700'
      {...props}
    />
  ),
  img: ({
    src,
    alt,
    ...props
  }: React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >) => (
    <img
      src={src}
      alt={alt}
      className='my-8 rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-800 dark:bg-gray-900/50'
      {...props}
    />
  ),
  table: ({
    children,
    ...props
  }: React.DetailedHTMLProps<
    React.TableHTMLAttributes<HTMLTableElement>,
    HTMLTableElement
  >) => (
    <div className='my-6 w-full overflow-y-auto'>
      <table className='w-full border-collapse text-sm' {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({
    children,
    ...props
  }: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLTableSectionElement>,
    HTMLTableSectionElement
  >) => (
    <thead
      className='border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50'
      {...props}
    >
      {children}
    </thead>
  ),
  tbody: ({
    children,
    ...props
  }: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLTableSectionElement>,
    HTMLTableSectionElement
  >) => <tbody {...props}>{children}</tbody>,
  tr: ({
    children,
    ...props
  }: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLTableRowElement>,
    HTMLTableRowElement
  >) => (
    <tr
      className='border-b border-gray-100 last:border-0 dark:border-gray-800'
      {...props}
    >
      {children}
    </tr>
  ),
  th: ({
    children,
    ...props
  }: React.DetailedHTMLProps<
    React.ThHTMLAttributes<HTMLTableHeaderCellElement>,
    HTMLTableHeaderCellElement
  >) => (
    <th className='border-r border-gray-100 p-4 text-left font-medium text-gray-900 last:border-0 dark:border-gray-800 dark:text-gray-100'>
      {children}
    </th>
  ),
  td: ({
    children,
    ...props
  }: React.DetailedHTMLProps<
    React.TdHTMLAttributes<HTMLTableDataCellElement>,
    HTMLTableDataCellElement
  >) => (
    <td
      className='border-r border-gray-100 p-4 text-gray-700 last:border-0 dark:border-gray-800 dark:text-gray-300'
      {...props}
    >
      {children}
    </td>
  ),
}
