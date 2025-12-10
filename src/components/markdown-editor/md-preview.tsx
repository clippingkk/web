// import { Streamdown } from 'streamdown'
// import { MarkdownComponents } from '../RichTextEditor/markdown-components'

type MarkdownPreviewProps = {
  value: string
}

function MarkdownPreview(props: MarkdownPreviewProps) {
  const { value } = props
  return (
    <div className='text-lg'>
      {value}
    </div>
  )
  // return (
  //   <div className='text-lg'>
  //     <Streamdown components={MarkdownComponents}>
  //       {value}
  //     </Streamdown>
  //   </div>
  // )
}

export default MarkdownPreview
