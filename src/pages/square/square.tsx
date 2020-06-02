import React from 'react'
import { usePageTrack } from '../../hooks/tracke'

function SquarePage() {
  usePageTrack('square')
  return (
    <section className='flex items-center justify-center'>
      <div className='my-12 rounded-sm text-6xl font-light shadow-2xl p-8'>
        🤦‍♂️ 广场功能暂未开放哦~
      </div>
    </section>
  )
}

export default SquarePage
