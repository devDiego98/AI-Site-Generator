import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Spinner } from '@/atoms/Spinner'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: ReactNode
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Spinner size="sm" label="" /> : leftIcon}
      <span>{children}</span>
    </button>
  )
}
