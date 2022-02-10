import React from 'react'

type SwitcherProps = {
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
  name?: string
}


function Switcher ({
  checked,
  onChange,
  name,
  disabled,
  ...props
}: SwitcherProps) {
  return (
    <label
      {...props}
      className={'relative inline-block w-6 h-6 align-middle cursor-pointer select-none ' + (disabled ? 'opacity-70 cursor-not-allowed' : '') }
      onClick={disabled ? undefined : () => onChange(!!checked)}
    >
      <input type="hidden" name={name} value={checked ? 1 : 0} />
      <span className={'absolute top-0 left-0 bottom-0 right-0 rounded-lg bg-gray-200 ' + (checked ? 'bg-purple-400' : '') } />
      <span className={'absolute top-1 bottom-1 right-3 left-1 bg-white rounded-lg transition-all duration-100 ' + (checked ? ' right-1 left-3 ' : '')} />
    </label>
  )
}

export default Switcher
