import { Switch } from '@mantine/core'
import React from 'react'

type SwitcherProps = {
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
  name?: string
}

function Switcher({
  checked,
  onChange,
  name,
  disabled,
}: SwitcherProps) {
  return (
    <Switch
      // label={name}
      checked={checked}
      disabled={disabled}
      onChange={e => onChange(e.currentTarget.checked)}
    />
  )
}

export default Switcher
