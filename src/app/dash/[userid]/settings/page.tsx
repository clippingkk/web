import React from 'react'
import SettingsPageContent from './content'
import { metadata as indexMetadata } from '../../../../components/og/og-with-index'

type PageProps = {
}
export const metadata = indexMetadata


function Page(props: PageProps) {
  return (
    <SettingsPageContent />
  )
}

export default Page
