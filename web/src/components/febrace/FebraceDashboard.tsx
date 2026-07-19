'use client'

import { useState, useEffect } from 'react'
import { Award, Download, Loader } from 'lucide-react'
import type { FebraceData } from '@/lib/types'
import { ProjectOverview } from './ProjectOverview'
import { PhotoGallery } from './PhotoGallery'
import { BarChart } from '@/components/charts/BarChart'
import { DoughnutChart } from '@/components/charts/DoughnutChart'
import { CalendarView } from '@/components/calendar/CalendarView'
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline'

export function FebraceDashboard() {
  const [data, setData] = useState<FebraceData | null>(null)

  useEffect(() => {
    fetch('/api/febrace').then(r => r.json()).then(setData)
  }, [])

  if (!data) {
    return (
      <div className="flex items-center justify-center py-16 text-zinc-400">
        <Loader size={20} className="mr-2 animate-spin" /> Carregando...
      </div>
    )
  }

  const tasksByStatus = [
    { label: 'A Fazer', value: data.tasks.filter(t => t.status === 'a_fazer').length, color: '#a1a1aa' },
    { label: 'Em Andamento', value: data.tasks.filter(t => t.status === 'em_andamento').length, color: '#0ea5e9' },
    { label: 'Em Revisão', value: data.tasks.filter(t => t.status === 'em_revisao').length, color: '#f59e0b' },
    { label: 'Concluído', value: data.tasks.filter(t => t.status === 'concluido').length, color: '#22c55e' },
  ]

  const componentsByStatus = [
    { label: 'Instalado', value: data.components.filter(c => c.status === 'instalado').length, color: '#22c55e' },
    { label: 'Em Estoque', value: data.components.filter(c => c.status === 'em_estoque').length, color: '#3b82f6' },
    { label: 'Em Compra', value: data.components.filter(c => c.status === 'em_compra').length, color: '#f59e0b' },
    { label: 'Defeituoso', value: data.components.filter(c => c.status === 'defeituoso').length, color: '#ef4444' },
  ]

  const testResults = data.tests.map(t => ({
    label: t.name.length > 15 ? t.name.slice(0, 15) + '...' : t.name,
    value: t.result,
    color: t.result >= 80 ? '#22c55e' : t.result >= 50 ? '#f59e0b' : '#ef4444',
  }))

  function handlePrint() {
    window.print()
  }

  return (
    <div className="space-y-8 print:space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Award size={24} className="text-indigo-600" />
          <h1 className="text-2xl font-bold text-zinc-900">Área FEBRACE</h1>
        </div>
        <button onClick={handlePrint}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-zinc-800">
          <Download size={16} />
          Exportar PDF
        </button>
      </div>

      <ProjectOverview stats={data.stats} memberCount={data.teamMembers.length} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">Tarefas por Status</h3>
          <BarChart data={tasksByStatus} />
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">Componentes por Status</h3>
          <DoughnutChart data={componentsByStatus} />
        </div>
      </div>

      {testResults.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">Resultados de Testes</h3>
          <BarChart data={testResults} />
        </div>
      )}

      <PhotoGallery photos={data.photos} />

      <CalendarView />

      {data.diary.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">Diário de Bordo</h3>
          <div className="space-y-4">
            {data.diary.slice(0, 3).map(entry => (
              <div key={entry.id} className="rounded-lg border border-zinc-100 bg-zinc-50 p-4">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-semibold text-indigo-600">{entry.date}</span>
                  <span className="text-[10px] text-zinc-400">— {entry.author}</span>
                </div>
                <p className="text-sm text-zinc-700">{entry.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.activities.length > 0 && (
        <ActivityTimeline
          initialActivities={data.activities.slice(0, 10)}
          totalActivities={data.activities.length}
        />
      )}
    </div>
  )
}
