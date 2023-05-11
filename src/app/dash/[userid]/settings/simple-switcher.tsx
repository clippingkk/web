import React from 'react'
import { Switch } from '@mantine/core'

type SimpleSwitcherProps = {
  checked: boolean
  onChange: (checked: boolean) => void
}

function SimpleSwitcher(props: SimpleSwitcherProps) {
  const { checked, onChange } = props
  return (
    <Switch
      checked={checked}
      onChange={e => onChange(e.currentTarget.checked)}
      size='xl'
    />
  )
}

export default SimpleSwitcher
