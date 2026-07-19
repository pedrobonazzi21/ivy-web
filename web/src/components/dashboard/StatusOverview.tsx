'use client'

import { useState } from 'react'
import { CheckCircle, FileText, Users, Box, FlaskConical, ListTodo, Pencil } from 'lucide-react'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StatCard } from '@/components/dashboard/StatCard'
import type { ProjectStats } from '@/lib/types'

type StatusOverviewProps = {
  stats: ProjectStats
}

export function StatusOverview({ stats }: StatusOverviewProps) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(stats.progress)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'definiu progresso para', target: `${value}%` }),
    })
    setEditing(false)
    setSaving(false)
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Status Geral</h2>
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={value}
                  onChange={e => setValue(Number(e.target.value))}
                  className="h-2 w-28 cursor-pointer accent-indigo-600"
                />
                <span className="w-10 text-right text-sm font-medium text-zinc-500">{value}%</span>
                <button onClick={handleSave} disabled={saving}
                  className="rounded bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-700 disabled:opacity-50">
                  {saving ? '...' : 'Salvar'}
                </button>
              </>
            ) : (
              <>
                <span className="text-sm font-medium text-zinc-500">{stats.progress}%</span>
                <button onClick={() => { setValue(stats.progress); setEditing(true) }}
                  className="rounded p-1 text-zinc-400 hover:text-indigo-600">
                  <Pencil size={14} />
                </button>
              </>
            )}
          </div>
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
