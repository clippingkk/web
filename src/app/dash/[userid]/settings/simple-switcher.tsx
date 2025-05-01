import React from 'react'
import Switch from '@annatarhe/lake-ui/form-switch-field'

type SimpleSwitcherProps = {
  checked: boolean
  onChange: (checked: boolean) => void
}

function SimpleSwitcher(props: SimpleSwitcherProps) {
  const { checked, onChange } = props
  return (
    <Switch
      value={checked}
      onChange={e => onChange(e)}
      label={undefined}
    />
  )
}

export default SimpleSwitcher
