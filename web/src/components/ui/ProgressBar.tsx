'use client'

type ProgressBarProps = {
  value: number
  className?: string
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div className={`h-3 w-full overflow-hidden rounded-full bg-zinc-200 ${className ?? ''}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
