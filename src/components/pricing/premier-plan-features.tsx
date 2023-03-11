import { HoverCard, Text } from '@mantine/core'
import React from 'react'
import CommonFeatures from './common-features'
import FreePlanFeatures from './free-plan-features'

type PremierPlanFeaturesProps = {
  children?: React.ReactNode
}

function PremierPlanFeatures(props: PremierPlanFeaturesProps) {
  return (
    <ul className=' text-xl'>
      <li className='mb-4'>
        ✅ Upload with unlimited clippings
      </li>
      <li className='mb-4'>
        ✅ Free 1000 AI call per month
      </li>
      <CommonFeatures />
      <li className='mb-4'>
        ✅ Access via RSS
      </li>
      <li className='mb-4'>
        ✅ Free first 10 AI call
      </li>
      {props.children}
    </ul>
  )
}

export default PremierPlanFeatures
