import React, { useMemo } from 'react'

type ProgressBlockProps = {
  value: number
  max: number
  className?: string
  children?: React.ReactElement
}

function ProgressBlock(props: ProgressBlockProps) {
  const blocks = useMemo<number[]>(() => {
    return new Array(props.max).fill(0)
  }, [props.max])

  return (
    <div className={`w-full h-4 ${props.className}`}>
      <div className='w-full h-full bg-gray-400 rounded flex'>
        {blocks.map((k, i) => (
          <div
            key={i}
            className={` border-r h-full border-gray-500 last:border-r-0 ${i < props.value ? 'bg-blue-600' : ''}`}
            style={{
              width: `calc(100% / ${props.max})`
            }}
          />
        ))}
      </div>
      {props.children}
    </div>
  )
}

export default ProgressBlock
