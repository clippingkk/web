import React from 'react'
import { UserContent } from '../../store/user/type'

type TopUsersProps = {
  users?: UserContent[]
}

function TopUsers(props: TopUsersProps) {
  if (!props.users) {
    return null
  }
  return (
    <div>
      top users
    </div>
  )
}

export default TopUsers
