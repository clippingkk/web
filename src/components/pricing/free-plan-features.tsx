import React from 'react'
import CommonFeatures from './common-features'

type FreePlanFeaturesProps = {
  children?: React.ReactNode
}

function FreePlanFeatures(props: FreePlanFeaturesProps) {
  return (
    <ul className=' text-xl'>
      <li className='mb-4'>
        ✅ Up to 2000 clippings
      </li>
      <li className='mb-4'>
        ✅ Free first 10 AI call
      </li>
      <CommonFeatures />
      <li className='mb-4'>
        ✅ Access via iOS app
      </li>
      <li className='mb-4'>
        ✅ Email supports
      </li>
      {props.children}
    </ul>
  )
}

export default FreePlanFeatures
