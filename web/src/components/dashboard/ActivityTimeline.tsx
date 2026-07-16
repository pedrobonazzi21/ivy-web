'use client'

import { Clock } from 'lucide-react'
import type { Activity } from '@/lib/types'

type ActivityTimelineProps = {
  activities: Activity[]
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
        <Clock size={16} />
        Linha do Tempo
      </h3>
      <div className="space-y-0">
        {activities.map((activity, i) => (
          <div key={activity.id} className="relative flex gap-4 pb-4 last:pb-0">
            {i < activities.length - 1 && (
              <div className="absolute left-[7px] top-4 h-full w-px bg-zinc-200" />
            )}
            <div className="mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-indigo-500 bg-white" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-zinc-800">
                <span className="font-medium">{activity.user}</span>{' '}
                {activity.action}{' '}
                <span className="font-medium text-indigo-600">{activity.target}</span>
              </p>
              <p className="text-xs text-zinc-400">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
