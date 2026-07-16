'use client'

type CardProps = {
  title?: string
  children: React.ReactNode
  className?: string
}

export function Card({ title, children, className }: CardProps) {
  return (
    <div className={`rounded-xl border border-zinc-200 bg-white p-6 shadow-sm ${className ?? ''}`}>
      {title && (
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}
