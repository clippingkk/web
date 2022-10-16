import React from 'react'

type ButtonSimpleProps = {
  onClick: () => void
  disabled?: boolean
  text: string
}

function ButtonSimple(props: ButtonSimpleProps) {
  return (
    <button
      onClick={props.onClick}
      className='text-white w-full rounded bg-blue-400 hover:bg-blue-500 py-4 disabled:bg-gray-300 disabled:hover:bg-gray-300 transition-all duration-300 mt-4'
      disabled={props.disabled}
    >
      {props.text}
    </button>
  )
}

export default ButtonSimple
