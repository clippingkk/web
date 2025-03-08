'use client'
import { Divider, Text, Title } from '@mantine/core'
import React from 'react'
import { usePageTrack } from '@/hooks/tracke'

function PolicySupportPage() {
  usePageTrack('support')
  return (
    <section className='page p-20 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200'>
      <div>
        {/* <h1 className='text-center font-bold text-3xl'></h1> */}
        <Title className=' text-center'>
          Support information
        </Title>

        <Divider my='lg' />

        <Text className='text-center'>
          If you need any help, feel free to send your any question to the email below.
        </Text>

        <a href='mailto:annatar.he+ck.support@gmail.com' className=' block text-center text-lg hover:underline py-4'>
          annatar.he+ck.support@gmail.com
        </a>
      </div>
    </section>
  )
}

export default PolicySupportPage
