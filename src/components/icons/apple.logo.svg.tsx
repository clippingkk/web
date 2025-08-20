import Image from 'next/image'
import React from 'react'

type IconAppleLogoProps = {
  size: number
  className?: string
}

function IconAppleLogo(props: IconAppleLogoProps) {
  return (
    <Image
      src="/apple.logo.svg"
      width={props.size}
      height={props.size}
      className={props.className}
      alt="apple"
    />
  )
}

export default IconAppleLogo
