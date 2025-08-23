import MetamaskLogo from '../icons/metamask.logo.svg'

type MetamaskButtonViewProps = {
  loading: boolean
  onClick: () => void
  disabled: boolean
}

function MetamaskButtonView(props: MetamaskButtonViewProps) {
  const { loading: disabled, onClick: onMetamaskLogin, loading } = props
  return (
    <button
      onClick={onMetamaskLogin}
      disabled={disabled}
      className='relative w-full h-16 px-6 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group'
    >
      <div className='flex items-center justify-center gap-3'>
        {loading ? (
          <div className='w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin' />
        ) : (
          <MetamaskLogo
            size={20}
            className='group-hover:scale-110 transition-transform duration-200'
          />
        )}
        <span className='text-base font-medium text-gray-900 dark:text-zinc-50'>
          Continue with MetaMask
        </span>
      </div>
    </button>
  )
}

export default MetamaskButtonView
