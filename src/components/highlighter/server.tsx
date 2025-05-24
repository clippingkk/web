import type { BundledLanguage } from 'shiki'
import { codeToHtml } from 'shiki'

interface Props {
  className?: string
  children: string
  lang: BundledLanguage
}

async function CodeBlock(props: Props) {
  const out = await codeToHtml(props.children, {
    lang: props.lang,
    theme: 'github-dark',
  })

  return (
    <div
      className={props.className}
      dangerouslySetInnerHTML={{ __html: out }}
    />
  )
}

export default CodeBlock
