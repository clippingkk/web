import React from 'react'
import { Switch } from '@headlessui/react'

type SimpleSwitcherProps = {
  checked: boolean
  onChange: (checked: boolean) => void
}

function SimpleSwitcher(props: SimpleSwitcherProps) {
  return (
    <Switch
      checked={props.checked}
      onChange={props.onChange}
      className={
        `${props.checked ? 'bg-blue-600' : 'bg-gray-200'
        } relative inline-flex items-center h-12 rounded-full w-24`
      }
    >
      <span className='sr-only'>
        {props.checked ? 'dark' : 'light'}
      </span>
      <span
        className={`${props.checked ? 'translate-x-12' : 'translate-x-2'
          } transition ease-in-out duration-200 inline-block w-10 h-10 transform bg-white rounded-full`}
      />
    </Switch>
  )
}

export default SimpleSwitcher
