'use client'

import ContributionWall from '@annatarhe/lake-ui/contribution-wall'
import dayjs from 'dayjs'

import { useTranslation } from '@/i18n/client'
import { toHtmlLang } from '@/lib/theme'

type PersonalActivityProps = {
  data: { date: string; count: number }[]
}

function PersonalActivity(props: PersonalActivityProps) {
  const { t, i18n } = useTranslation(undefined, 'profile')
  const data = props.data.map((x) => ({
    date: dayjs(x.date).startOf('day').unix(),
    count: x.count,
  }))
  const utcOffset = new Date().getTimezoneOffset()
  const startDate = dayjs().subtract(1, 'y').startOf('day').add(-utcOffset, 'm')

  return (
    <ContributionWall
      data={data}
      startDate={startDate.toDate()}
      colorScheme="accent"
      locale={toHtmlLang(i18n.language)}
      labels={{ less: t('activity.less'), more: t('activity.more') }}
    />
  )
}

export default PersonalActivity
