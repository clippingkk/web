import React from 'react'
import Image from 'next/image'
import logo from '@/assets/logo.png'

type CKLogoProps = {
  className?: string
  size?: number
}

const logoBlurhash = 'LOA_3?K-0;:~x[n-NNkRAenO,-TJ'

function CKLogo(props: CKLogoProps) {
  const { size = 96, className = '' } = props
  return (
    <Image
      src={logo}
      alt="clippingkk logo"
      width={size}
      height={size}
      className={` rounded-sm shadow-2xl ${className}`}
    />
  )
}

export default CKLogo
