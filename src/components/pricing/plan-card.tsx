import { Divider } from '@mantine/core'
import React from 'react'

type PlanCardProps = {
  title: React.ReactNode | string
  description: string
  features: React.ReactNode
}

function PlanCard(props: PlanCardProps) {
  const { title, description, features } = props
  return (
    <div className='w-full flex justify-center dark:text-gray-100'>
      <div className='p-12 bg-blue-400 dark:bg-blue-500 bg-opacity-60 shadow-xl w-fit rounded-xl backdrop-blur-2xl hover:bg-opacity-80 duration-300 transition-all hover:scale-110'>
        {typeof title === 'string' ? (
          <h2 className='text-5xl'>{title}</h2>
        ) : title}
        <h6 className=' text-lg mt-4'>{description}</h6>
        <Divider className='my-8' />
        <div>
          {features}
        </div>
      </div>
    </div>
  )
}

export default PlanCard
