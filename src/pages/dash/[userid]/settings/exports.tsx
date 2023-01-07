import { Divider, Group } from '@mantine/core'
import React from 'react'
import ExportToFlomo from './export.flomo'
import ExportToNotion from './export.notion'

function Exports() {
  return (
    <div className='w-full flex justify-center items-center'>
      <Group>
        <ExportToFlomo />
        <Divider orientation='vertical' />
        <ExportToNotion />
      </Group>
    </div>
  )
}

export default Exports
