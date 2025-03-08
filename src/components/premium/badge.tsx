import { Badge } from '@mantine/core'
import React from 'react'

function PremiumBadge() {
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
