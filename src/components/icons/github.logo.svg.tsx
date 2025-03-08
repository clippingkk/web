import React from 'react'
import Image from 'next/image'

type GithubLogoProps = {
  size?: number
  className?: string
}

function GithubLogoV2(props: GithubLogoProps) {
  return (
    <Image
      src='/github.logo.svg'
      width={props.size ?? 28}
      height={props.size ?? 28}
      className={props.className}
      alt='github'
    />
  )
}


export default GithubLogoV2
