import React, { useMemo } from 'react'

type ClippingContentProps = {
  content: string
  className?: string
}

function ClippingContent(props: ClippingContentProps) {
  const lines: string[] = useMemo(() => {
    // 去除空格
    const local = props.content.replace(/\[\d*\]/, '')
    // list 则分行
    const raws = local.split('•')
    return raws
  }, [props.content])
  return (
    <React.Fragment>
      {lines.map((x, i) => (<p key={i} className={props.className}>{x}</p>))}
    </React.Fragment>
  )
}

export default ClippingContent
