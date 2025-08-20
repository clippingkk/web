import React from 'react'
import { KonzertThemeMap } from '../../services/utp'

type ThemePickerProps = {
  className?: string
  current: number
  onChange: (t: number) => void
}

function ThemePicker(props: ThemePickerProps) {
  const themes = Object.values(KonzertThemeMap)

  return (
    <div className={`flex flex-wrap gap-2 ${props.className}`}>
      {themes.map((theme) => {
        const isSelected = props.current === theme.id
        return (
          <button
            key={theme.id}
            type="button"
            onClick={() => props.onChange(theme.id)}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${
                isSelected
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }
            `}
            aria-pressed={isSelected}
          >
            {theme.name}
          </button>
        )
      })}
    </div>
  )
}

export default ThemePicker
