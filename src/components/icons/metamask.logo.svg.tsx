import Image from 'next/image'
import React from 'react'

type MetamaskLogoProps = {
}

function MetamaskLogo(props: MetamaskLogoProps) {
  return (
    <Image
      src='/metamask.logo.svg'
      width={48}
      height={48}
      alt='metamask'
    />
  )
}

export default MetamaskLogo
