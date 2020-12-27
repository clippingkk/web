import React from 'react'

type SimpleSwitcherProps = {
  checked: boolean
  onChange: (checked: boolean) => void
}

function SimpleSwitcher(props: SimpleSwitcherProps) {
  return (
    <div
     className={`w-24 h-10 rounded-3xl relative shadow-xl ${props.checked ? 'bg-blue-800' : 'bg-green-200'}`}
     onClick={() => {
       props.onChange(!props.checked)
      }}
    >
      <div
        className={`rounded-full shadow w-8 h-8 absolute left-1 top-1 transition-all transform duration-300 ease-in-out ${props.checked ? 'translate-x-14 bg-purple-600' : 'translate-x-0 bg-yellow-400'}`}
      />
    </div>
  )
}

export default SimpleSwitcher
