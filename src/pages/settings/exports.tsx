import React, { useState } from 'react'
import ExportToFlomo from './export.flomo'
import ExportToNotion from './export.notion'

type ExportsProps = {
}

function Exports(props: ExportsProps) {
  return (
    <div className='w-full flex justify-center items-center'>
      <ExportToFlomo />
      <ExportToNotion />
    </div>
  )
}

export default Exports
