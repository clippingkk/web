import React, { useCallback, useState } from 'react'
import { Picker } from 'emoji-mart'
import { fetchClipping_clipping_reactions } from '../../schema/__generated__/fetchClipping'

type ReactionsProps = {
  cid: Number
  reactions: readonly fetchClipping_clipping_reactions[]
}

function Reactions(props: ReactionsProps) {
  const [pickerVisible, setPickerVisible] = useState(false)
  // TODO: group by symbol
  const togglePicker = useCallback(() => {
    setPickerVisible(s => !s)
  }, [])
  return (
    <div>
      <div className='relative'>
        <button
          className='py-4 px-8 rounded-3xl hover:bg-gray-300'
          onClick={togglePicker}
        >➕</button>
        <div className={`${pickerVisible ? 'block' : 'hidden'} absolute left-full bottom-full z-20`}>
          <button onClick={togglePicker}>❌</button>
          <Picker onSelect={emoji => {
            console.log(emoji)
            togglePicker()
          }} />
        </div>
      </div>
    </div>
  )
}

export default Reactions
