import Image from 'next/image'

type MetamaskLogoProps = {
  size: number
  className?: string
}

function MetamaskLogo(props: MetamaskLogoProps) {
  return (
    <Image
      src='/metamask.logo.svg'
      width={props.size}
      height={props.size}
      className={props.className}
      alt='metamask'
    />
  )
}

export default MetamaskLogo
