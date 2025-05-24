import Switch from '@annatarhe/lake-ui/form-switch-field'

type SwitcherProps = {
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
  name?: string
}

function Switcher({ checked, onChange, disabled }: SwitcherProps) {
  return (
    <Switch
      // label={name}
      label={null}
      value={checked}
      disabled={disabled}
      onChange={(e) => onChange(e)}
    />
  )
}

export default Switcher
