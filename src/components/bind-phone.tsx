'use client'
import React from 'react'

type BindPhoneProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFinalCheck(phone: string, code: string): Promise<any>
}

function BindPhone(props: BindPhoneProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { onFinalCheck } = props
  return (
    <div>
      No phone number bind yet.
    </div>
  )
}

export default BindPhone
