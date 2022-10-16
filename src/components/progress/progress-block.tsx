import React, { useMemo } from 'react'

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
    <div className={`w-full h-4 ${props.className}`}>
      <div className='w-full h-full bg-gray-400 rounded flex'>
          <div
            className={` transition-all duration-200 border-r h-full border-gray-500 last:border-r-0 bg-blue-500 rounded`}
            style={{
              width: `${progress}%`
            }}
          />
      </div>
      {props.children}
    </div>
  )
}

export default ProgressBlock
