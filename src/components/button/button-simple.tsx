import WithLoading from '../with-loading'

type ButtonSimpleProps = {
  loading?: boolean
  onClick: () => void
  disabled?: boolean
  text: string
}

function ButtonSimple(props: ButtonSimpleProps) {
  return (
    <WithLoading loading={props.loading ?? false}>
      <button
        onClick={props.onClick}
        className="mt-4 w-full rounded-sm bg-blue-400 py-4 text-white transition-all duration-300 hover:bg-blue-500 disabled:bg-gray-300 disabled:hover:bg-gray-300"
        disabled={props.disabled}
      >
        {props.text}
      </button>
    </WithLoading>
  )
}

export default ButtonSimple
