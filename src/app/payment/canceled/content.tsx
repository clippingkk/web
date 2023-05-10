'use client'
import React from 'react'
import { Text } from '@mantine/core'
import Link from 'next/link'

function CanceledPageContent() {
  return (
    <>
      <Text>
        Sorry we could not process your payment, please try again
      </Text>
      <Link href='/pricing' className='mt-8'>
        go to plans
      </Link>
    </>
  )
}

export default CanceledPageContent
