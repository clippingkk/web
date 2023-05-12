import React from 'react'
import DashboardContainer from '../../../../components/dashboard-container/container'

type Profile404PageProps = {
}

function Profile404Page(props: Profile404PageProps) {
  return (
    <section>
      {/* <Head>
        <title>profile not found</title>
      </Head> */}
      <div className=' flex justify-center items-center dark:text-white text-lg mt-10'>
        user not found
      </div>
      </section>
  )
}

Profile404Page.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <DashboardContainer>
      {page}
    </DashboardContainer>
  )
}

export default Profile404Page
