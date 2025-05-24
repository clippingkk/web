import Button from '../button/button'
import MetamaskLogo from '../icons/metamask.logo.svg'

type MetamaskButtonViewProps = {
  loading: boolean
  onClick: () => void
  disabled: boolean
}

function MetamaskButtonView(props: MetamaskButtonViewProps) {
  const { loading: disabled, onClick: onMetamaskLogin, loading } = props
  return (
    <Button
      isLoading={loading}
      className="h-[62px] bg-gradient-to-br from-purple-500 to-purple-600 after:from-purple-500/40 after:to-purple-600/40 hover:shadow-purple-500/20"
      fullWidth
      size="lg"
      onClick={onMetamaskLogin}
      disabled={disabled}
    >
      <div className="flex items-center gap-4">
        <MetamaskLogo size={24} />
        <span className="text-lg">Metamask</span>
      </div>
    </Button>
  )
}

export default MetamaskButtonView
