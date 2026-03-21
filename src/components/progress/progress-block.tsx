import type React from 'react'
import { useMemo } from 'react'

type ProgressBlockProps = {
  value: number
  max: number
  className?: string
  children?: React.ReactElement
}

function ProgressBlock(props: ProgressBlockProps) {
  const progress = useMemo(() => {
    const p = (props.value / props.max) * 100
    if (Number.isNaN(p)) {
      return 1
    }
    if (p === 0) {
      return 1
    }
    if (p >= 100) {
      return 100
    }
    return p
  }, [props.value, props.max])

  return (
    <div className={`h-4 w-full ${props.className}`}>
      <div className="flex h-full w-full rounded-sm bg-gray-400">
        <div
          className={
            'h-full rounded-sm border-r border-gray-500 bg-blue-500 transition-all duration-200 last:border-r-0'
          }
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
      {props.children}
    </div>
  )
}

export default ProgressBlock
