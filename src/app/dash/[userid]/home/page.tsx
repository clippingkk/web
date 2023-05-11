import React from 'react'
import HomePageContent from './content'

type PageProps = {
  params: { userid: string }
}

function Page(props: PageProps) {
  const { userid } = props.params
  return (
    <HomePageContent userid={userid} />
  )
}

export default Page
