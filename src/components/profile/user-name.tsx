import React from 'react'
import PremiumBadge from '../premium/badge'
import { checkIsPremium } from '@/compute/user'

type UserNameProps = {
  name?: string
  premiumEndAt?: string
}

function UserName(props: UserNameProps) {
  const { name, premiumEndAt } = props

  const isPremium = checkIsPremium(premiumEndAt)

  if (!name) {
    return null
  }

  return (
    <div className='flex items-center'>
      <h3 className='text-2xl font-lxgw font-bold dark:text-gray-100'>
        {name}
      </h3>
      {isPremium && (
        <PremiumBadge />
      )}
    </div>
  )
}

export default UserName
