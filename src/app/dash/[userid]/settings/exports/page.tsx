'use client'
import { Divider, Group } from '@mantine/core'
import React from 'react'
import ExportToFlomo from './export.flomo'
import ExportToNotion from './export.notion'
import ExportToMail from './export.mail'

function Exports() {
  return (
    <div className='w-full flex justify-center items-center'>
      <Group>
        <ExportToFlomo />
        <Divider orientation='vertical' />
        <ExportToNotion />
        <Divider orientation='vertical' />
        <ExportToMail />
      </Group>
    </div>
  )
}

export default Exports
