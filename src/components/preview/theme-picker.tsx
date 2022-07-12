import React from 'react'
import { KonzertThemeMap } from '../../services/utp'

type ThemePickerProps = {
  current: number
  onChange: (t: number) => void
}

function ThemePicker(props: ThemePickerProps) {
  return (
    <div className='flex w-full flex-row'>
      {Object.values(KonzertThemeMap)
        .map(k => (
          <div
            className={`flex-1 mx-2 first:ml-0 last:mr-0 flex justify-center items-center`}
            key={k.id}
            onClick={(e: any) => {
              e.preventDefault()
              // guard if active
              if (props.current === k.id) {
                return
              }
              props.onChange(k.id)
            }}>
            <button className={`w-full py-2 duration-150 rounded transform hover:scale-105 bg-blue-400 focus:outline-none ${props.current === k.id ? 'bg-blue-600' : ''}`}>
              {k.name}
            </button>
          </div>
        ))}
    </div>
  )
}

export default ThemePicker
