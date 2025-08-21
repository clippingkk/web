'use client'

import { Loader2 } from 'lucide-react'
import type React from 'react'
import { cn } from '@/lib/utils'

// Common button classes
const baseButtonClasses =
  'relative z-10 inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-70'

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'link'
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl' | 'hero'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The visual style of the button
   * @default 'primary'
   */
  variant?: ButtonVariant
  /**
   * The size of the button
   * @default 'md'
   */
  size?: ButtonSize
  /**
   * Whether the button should take up the full width of its container
   * @default false
   */
  fullWidth?: boolean
  /**
   * Whether the button is in a loading state
   */
  isLoading?: boolean
  /**
   * Icon to display before the button text
   */
  leftIcon?: React.ReactNode
  /**
   * Icon to display after the button text
   */
  rightIcon?: React.ReactNode
  /**
   * Children elements
   */
  children: React.ReactNode
}

/**
 * Universal button component for ClippingKK with multiple variants and states
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   Click me
 * </Button>
 *
 * <Button variant="secondary" isLoading>
 *   Loading...
 * </Button>
 * ```
 */
export function Button({
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  children,
  ...props
}: ButtonProps) {
  const getVariantClasses = (variant: ButtonVariant) => {
    switch (variant) {
      case 'primary':
        return [
          'bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/20',
          'hover:-translate-y-1 hover:shadow-[0_0_20px_3px] hover:shadow-blue-500/30',
          'after:absolute after:inset-0 after:z-0 after:rounded-lg after:bg-gradient-to-r after:from-blue-500 after:via-sky-600 after:to-cyan-600 after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100',
          'before:absolute before:-inset-1 before:z-0 before:scale-[1.05] before:rounded-lg before:bg-gradient-to-r before:from-sky-400 before:to-blue-500 before:opacity-0 before:blur-md before:transition-all before:duration-300 hover:before:opacity-50',
        ].join(' ')
      case 'secondary':
        return [
          'bg-gradient-to-br from-cyan-500/80 to-blue-600/80 text-white/90 backdrop-blur-sm',
          'hover:-translate-y-1 hover:text-white hover:shadow-lg hover:shadow-cyan-500/20',
          'after:absolute after:inset-0 after:z-0 after:rounded-lg after:bg-gradient-to-r after:from-blue-500/40 after:to-cyan-500/40 after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100',
        ].join(' ')
      case 'outline':
        return [
          'border-2 border-[#045fab] bg-transparent text-[#045fab] dark:text-white',
          'hover:-translate-y-1 hover:bg-[#045fab]/10 hover:shadow-lg hover:shadow-[#045fab]/20',
          'dark:border-white/70 dark:hover:bg-white/10 dark:hover:shadow-white/10',
        ].join(' ')
      case 'ghost':
        return [
          'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/60',
          'hover:-translate-y-1',
        ].join(' ')
      case 'danger':
        return [
          'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/20',
          'hover:-translate-y-1 hover:shadow-[0_0_20px_3px] hover:shadow-red-500/30',
          'after:absolute after:inset-0 after:z-0 after:rounded-lg after:bg-gradient-to-r after:from-rose-600 after:to-red-600 after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100',
        ].join(' ')
      case 'link':
        return 'bg-transparent p-0 text-[#045fab] underline-offset-4 hover:underline dark:text-blue-400'
      default:
        return ''
    }
  }

  const getSizeClasses = (size: ButtonSize) => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm'
      case 'md':
        return 'px-4 py-2 text-base'
      case 'lg':
        return 'px-6 py-3 text-lg'
      case 'xl':
        return 'px-8 py-4 text-xl'
      case 'hero':
        return 'px-14 py-6 text-3xl font-black'
      default:
        return ''
    }
  }

  const buttonClasses = cn(
    baseButtonClasses,
    getVariantClasses(variant),
    getSizeClasses(size),
    fullWidth ? 'w-full' : '',
    className
  )

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Create a container for content to position it above the pseudo-elements */}
      <span className='relative z-10 flex items-center justify-center gap-2'>
        {isLoading ? (
          <Loader2 className='h-4 w-4 animate-spin' />
        ) : (
          leftIcon && <span className='flex items-center'>{leftIcon}</span>
        )}
        {children}
        {rightIcon && !isLoading && (
          <span className='flex items-center'>{rightIcon}</span>
        )}
      </span>
    </button>
  )
}

export default Button
