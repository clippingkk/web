import React from 'react'
import DashboardContainer from '../../../components/dashboard-container/container'

type LayoutProps = {
  children: React.ReactElement
}

function Layout(props: LayoutProps) {
  return (
    <DashboardContainer>
      {props.children}
    </DashboardContainer>
  )
}

export default Layout
