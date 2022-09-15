// @ts-ignore
import React, { useEffect, useRef } from 'react'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

type EmojiPickerProps = {
}

function EmojiPicker(props: EmojiPickerProps) {
  // const ref = useRef<HTMLDivElement>(null)

  // useEffect(() => {
    // import('emoji-mart').then((EmojiMart) => {
      // new EmojiMart.Picker({
         // ...props,
          // // data: data as any,
          // //  ref 
        // })
    // })
  // }, [])

  // return <div ref={ref} />
  return <Picker data={data} onEmojiSelect={console.log} />
}

export default EmojiPicker
