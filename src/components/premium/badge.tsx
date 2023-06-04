import { Badge } from '@mantine/core'
import React from 'react'

type PremiumBadgeProps = {
}

function PremiumBadge(props: PremiumBadgeProps) {
  return (
    <Badge
      variant="gradient"
      gradient={{ from: 'indigo', to: 'cyan' }}
      className='ml-2'
    >
      Premium
    </Badge>
  )
}

export default PremiumBadge
