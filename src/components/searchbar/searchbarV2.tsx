import React from 'react'
import { Command } from 'cmdk'
import ReactDOM from 'react-dom'

type SearchBarV2Props = {
  visible: boolean
  onClose: () => void
}

function SearchBarV2(props: SearchBarV2Props) {
  if (typeof window === 'undefined') {
    return null
  }

  console.log('will crrrr', props.visible)

  return (
  // retuReactDOM.createPortal(
    <Command.Dialog open={props.visible} onOpenChange={props.onClose} label="search snippets">
      <Command.Input />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>
        <Command.Group heading="Letters">
          <Command.Item>a</Command.Item>
          <Command.Item>b</Command.Item>
          <Command.Separator />
          <Command.Item>c</Command.Item>
        </Command.Group>
        <Command.Item>Apple</Command.Item>
      </Command.List>
    </Command.Dialog>
    // document.querySelector('#searchbar')!
  )
}

export default SearchBarV2
