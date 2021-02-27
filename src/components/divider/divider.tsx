import React from 'react'

type TDividerProps = {
  title: string

}

function Divider({ title }: TDividerProps) {
  return (
    <div className='w-full flex justify-center items-center my-4'>
      <span
       className='text-white text-lg py-4 px-8 z-10 rounded from-blue-400 to-blue-600 bg-gradient-to-br'
       >{title}</span>
    </div>
  )
}

export default Divider
