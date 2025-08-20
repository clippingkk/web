import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import React from 'react'

function EmojiPicker() {
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
