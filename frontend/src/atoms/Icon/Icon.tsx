import type { ReactNode, SVGAttributes } from 'react'

export type IconName =
  | 'sparkles'
  | 'code'
  | 'eye'
  | 'refresh'
  | 'chevron-right'
  | 'pencil'
  | 'folder'
  | 'copy'
  | 'check'
  | 'trash'

const paths: Record<IconName, ReactNode> = {
  sparkles: (
    <>
      <path d="M9.5 2 11 7l5 1.5L11 10l-1.5 5L8 10 3 8.5 8 7 9.5 2Z" />
      <path d="M18 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z" />
    </>
  ),
  code: (
    <>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  refresh: (
    <>
      <path d="M3 12a9 9 0 0 1 15-6" />
      <path d="M21 12a9 9 0 0 1-15 6" />
      <path d="M18 3v4h-4" />
      <path d="M6 21v-4H2" />
    </>
  ),
  'chevron-right': <path d="m9 18 6-6-6-6" />,
  pencil: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </>
  ),
  folder: (
    <>
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </>
  ),
  copy: (
    <>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </>
  ),
}

export interface IconProps extends SVGAttributes<SVGSVGElement> {
  name: IconName
  size?: number
}

export function Icon({ name, size = 18, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...props}
    >
      {paths[name]}
    </svg>
  )
}
