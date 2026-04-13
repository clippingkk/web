'use client'
import type React from 'react'

type ExportTriggerButtonProps = {
  onClick: () => void
  icon: React.ReactNode
  label: string
}

function ExportTriggerButton({ onClick, icon, label }: ExportTriggerButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-white p-4 transition-colors duration-200 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:bg-gray-800 dark:hover:bg-gray-700/80 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-900"
    >
      {icon}
      <span className="font-medium text-gray-800 dark:text-gray-200">
        {label}
      </span>
    </button>
  )
}

export default ExportTriggerButton
