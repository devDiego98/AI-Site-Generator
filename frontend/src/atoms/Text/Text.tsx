import type { HTMLAttributes, ReactNode } from 'react'
import styles from './Text.module.css'

export type TextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label'
export type TextColor = 'primary' | 'secondary' | 'muted' | 'accent' | 'inverse' | 'onLight'

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'label'
  variant?: TextVariant
  color?: TextColor
  children: ReactNode
}

const defaultTag: Record<TextVariant, TextProps['as']> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  body: 'p',
  caption: 'span',
  label: 'label',
}

export function Text({
  as,
  variant = 'body',
  color = 'primary',
  children,
  className = '',
  ...props
}: TextProps) {
  const Tag = as ?? defaultTag[variant] ?? 'p'

  return (
    <Tag className={`${styles.text} ${styles[variant]} ${styles[color]} ${className}`} {...props}>
      {children}
    </Tag>
  )
}
