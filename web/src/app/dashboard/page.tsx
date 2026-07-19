'use client'

import { useState, useEffect } from 'react'
import { StatusOverview } from '@/components/dashboard/StatusOverview'
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline'
import { StockAlert } from '@/components/components/StockAlert'
import type { ProjectStats, Activity } from '@/lib/types'
import { useRouter } from 'next/navigation'

type DashboardData = {
  stats: ProjectStats
  activities: Activity[]
  totalActivities: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(setData)

    fetch('/api/auth/me')
      .then(res => res.json())
      .then(d => {
        if (!d.authenticated) router.push('/')
        else setUser(d.user)
      })
  }, [router])

  if (!data || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-500">
        Carregando...
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="mb-6">
        <StockAlert />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StatusOverview stats={data.stats} />
        </div>
        <div>
          <ActivityTimeline
            initialActivities={data.activities}
            totalActivities={data.totalActivities}
            refreshInterval={30000}
          />
        </div>
      </div>
    </div>
  )
}
