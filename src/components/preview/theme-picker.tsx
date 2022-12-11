import { Button, SegmentedControl } from '@mantine/core'
import React from 'react'
import { KonzertThemeMap } from '../../services/utp'

type ThemePickerProps = {
  className?: string
  current: number
  onChange: (t: number) => void
}

function ThemePicker(props: ThemePickerProps) {
  return (
    <SegmentedControl
      className={props.className}
      value={props.current.toString()}
      onChange={(val) => props.onChange(~~val)}
      data={Object.values(KonzertThemeMap).map(x => ({
        label: x.name,
        value: x.id.toString()
      }))}
    />
  )
}

export default ThemePicker
