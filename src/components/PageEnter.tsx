import type { ReactNode } from 'react'

/** Subtle fade + rise on route mount. */
export function PageEnter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`page-enter ${className}`}>{children}</div>
}
