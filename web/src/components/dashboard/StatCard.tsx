'use client'

import { type LucideIcon } from 'lucide-react'

type StatCardProps = {
  icon: LucideIcon
  label: string
  value: string | number
  className?: string
}

export function StatCard({ icon: Icon, label, value, className }: StatCardProps) {
  return (
    <div className={`flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm ${className ?? ''}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-zinc-900">{value}</p>
        <p className="text-sm text-zinc-500">{label}</p>
      </div>
    </div>
  )
}
