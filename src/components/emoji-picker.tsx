import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

function EmojiPicker() {
  return <Picker data={data} onEmojiSelect={() => {}} />
}

export default EmojiPicker
