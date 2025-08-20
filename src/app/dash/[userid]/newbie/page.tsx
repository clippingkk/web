import type { Metadata } from 'next'
import React from 'react'
import NewbiePageContent from './content'

export const metadata: Metadata = {
  title: 'Welcome to ClippingKK',
}

type Props = {
  params: Promise<{ userid: string }>
}

async function Page(props: Props) {
  const { userid } = await props.params
  return <NewbiePageContent uid={~~userid} />
}

export default Page
