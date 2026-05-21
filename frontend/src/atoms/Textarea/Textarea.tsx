import type { TextareaHTMLAttributes } from 'react'
import styles from './Textarea.module.css'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean
}

export function Textarea({ hasError = false, className = '', ...props }: TextareaProps) {
  return (
    <textarea
      className={`${styles.textarea} ${hasError ? styles.error : ''} ${className}`}
      {...props}
    />
  )
}
