import React from 'react'
import DashboardContainer from '@/components/dashboard-container/container'
import { cookies } from 'next/headers'

function Profile404Page() {
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

Profile404Page.getLayout = async function getLayout(page: React.ReactElement) {
  const cs = await cookies()
  const myUid = cs.get('uid')?.value
  return (
    <DashboardContainer uidOrDomain={myUid}>
      {page}
    </DashboardContainer>
  )
}

export default Profile404Page
