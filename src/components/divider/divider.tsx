import React from 'react'

type TDividerProps = {
  title: string

}

function Divider({ title }: TDividerProps) {
  return (
    <div className="relative flex items-center w-full my-8">
      <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
      <span className="flex-shrink mx-4 px-4 py-2 text-lg font-medium 
                       text-slate-700 dark:text-slate-300 
                       bg-slate-100 dark:bg-slate-800 
                       rounded-md shadow-sm 
                       border border-slate-200 dark:border-slate-700">
        {title}
      </span>
      <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
    </div>
  )
}

export default Divider
