import type { HTMLAttributes } from 'react'

function Card({ children, className = '', ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <article
      className={[
        'rounded-lg border border-slate-200 bg-white shadow-sm',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </article>
  )
}

export default Card
