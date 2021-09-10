import React from 'react'
import ExportToFlomo from './export.flomo'
import ExportToNotion from './export.notion'

function Exports() {
  return (
    <div className='w-full flex justify-center items-center'>
      <ExportToFlomo />
      <ExportToNotion />
    </div>
  )
}

export default Exports
