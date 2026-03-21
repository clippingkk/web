import Image from 'next/image'

import logoDark from '@/assets/logo-dark.svg'
import logoLight from '@/assets/logo-light.svg'

type CKLogoProps = {
  className?: string
  size?: number
}

function CKLogo(props: CKLogoProps) {
  const { size = 96, className = '' } = props
  return (
    <>
      <Image
        src={logoLight}
        alt="clippingkk logo"
        width={size}
        height={size}
        className={`rounded-sm shadow-2xl dark:hidden ${className}`}
      />
      <Image
        src={logoDark}
        alt="clippingkk logo"
        width={size}
        height={size}
        className={`hidden rounded-sm shadow-2xl dark:block ${className}`}
      />
    </>
  )
}

export default CKLogo
