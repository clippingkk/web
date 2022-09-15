// @ts-ignore
import React, { useEffect, useRef } from 'react'
import data from '@emoji-mart/data'

type EmojiPickerProps = {
}

function EmojiPicker(props: EmojiPickerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    import('emoji-mart').then((EmojiMart) => {
      new EmojiMart.Picker({
         ...props,
          // data: data as any,
          //  ref 
        })
    })
  }, [])

  return <div ref={ref} />
}

export default EmojiPicker
