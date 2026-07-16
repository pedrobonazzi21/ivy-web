'use client'

import { CheckCircle, FileText, Users, Box, FlaskConical, ListTodo } from 'lucide-react'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StatCard } from '@/components/dashboard/StatCard'
import type { ProjectStats } from '@/lib/types'

type StatusOverviewProps = {
  stats: ProjectStats
}

export function StatusOverview({ stats }: StatusOverviewProps) {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Status Geral</h2>
          <span className="text-sm font-medium text-zinc-500">{stats.progress}%</span>
        </div>
        <ProgressBar value={stats.progress} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard icon={ListTodo} label="Tarefas abertas" value={stats.openTasks} />
        <StatCard icon={Box} label="Componentes" value={stats.totalComponents} />
        <StatCard icon={FileText} label="Arquivos" value={stats.totalFiles} />
        <StatCard icon={FlaskConical} label="Testes realizados" value={stats.totalTests} />
        <StatCard icon={Users} label="Integrantes" value={stats.totalMembers} />
        <StatCard
          icon={CheckCircle}
          label="Última atualização"
          value={stats.lastUpdate}
        />
      </div>
    </div>
  )
}
