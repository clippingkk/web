import React from 'react'
import ContributionWall from '@annatarhe/lake-ui/contribution-wall'
import { ProfileQuery } from '@/schema/generated'
import dayjs from 'dayjs'

type PersonalActivityProps = {
  data: ProfileQuery['me']['analysis']['daily']
}

function PersonalActivity(props: PersonalActivityProps) {
  const data = props.data.map(x => ({
    date: dayjs(x.date).startOf('day').unix(),
    count: x.count
  }))

  const utcOffset = new Date().getTimezoneOffset()
  const startDate = dayjs().subtract(1, 'y').startOf('day').add(-utcOffset, 'm')

  return (
    <ContributionWall
      data={data}
      startDate={startDate.toDate()}
    />
  )
}

export default PersonalActivity
