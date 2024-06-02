import MetamaskLogo from '../icons/metamask.logo.svg'
import { Button } from '@mantine/core'

type MetamaskButtonViewProps = {
  loading: boolean
  onClick: () => void
  disabled: boolean
}

function MetamaskButtonView(props: MetamaskButtonViewProps) {
  const { loading: disabled, onClick: onMetamaskLogin, loading } = props
  return (
    <Button
      loading={loading}
      className='h-[47px] rounded hover:shadow-lg bg-purple-400 flex justify-center items-center hover:scale-105 hover:bg-purple-500 duration-150 w-full flex-col'
      color='rgb(192 132 252 / var(--tw-bg-opacity))'
      fullWidth
      h={'62px'}
      onClick={onMetamaskLogin}
      disabled={disabled}
    >
      <MetamaskLogo size={24} />
      <span className='text-lg ml-4'>Metamask</span>
    </Button>
  )
}

export default MetamaskButtonView
