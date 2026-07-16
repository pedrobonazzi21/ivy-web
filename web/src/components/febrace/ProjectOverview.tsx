'use client'

import { Award, Users, FileText, FlaskConical, ListTodo, Box } from 'lucide-react'
import type { ProjectStats } from '@/lib/types'

type ProjectOverviewProps = {
  stats: ProjectStats
  memberCount: number
}

export function ProjectOverview({ stats, memberCount }: ProjectOverviewProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-gradient-to-br from-indigo-600 to-sky-600 p-8 text-white shadow-lg">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
          <Award size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Robô Educacional FEBRACE</h1>
          <p className="mt-1 text-sm text-white/80">Plataforma IVY — Gestão de Projetos de Engenharia</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-white/90">Progresso Geral</span>
          <span className="text-lg font-bold">{stats.progress}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${stats.progress}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur">
          <ListTodo size={18} className="mx-auto mb-1 text-white/80" />
          <p className="text-lg font-bold">{stats.openTasks}</p>
          <p className="text-[10px] text-white/70">Tarefas</p>
        </div>
        <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur">
          <Box size={18} className="mx-auto mb-1 text-white/80" />
          <p className="text-lg font-bold">{stats.totalComponents}</p>
          <p className="text-[10px] text-white/70">Componentes</p>
        </div>
        <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur">
          <FileText size={18} className="mx-auto mb-1 text-white/80" />
          <p className="text-lg font-bold">{stats.totalFiles}</p>
          <p className="text-[10px] text-white/70">Arquivos</p>
        </div>
        <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur">
          <FlaskConical size={18} className="mx-auto mb-1 text-white/80" />
          <p className="text-lg font-bold">{stats.totalTests}</p>
          <p className="text-[10px] text-white/70">Testes</p>
        </div>
        <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur">
          <Users size={18} className="mx-auto mb-1 text-white/80" />
          <p className="text-lg font-bold">{memberCount}</p>
          <p className="text-[10px] text-white/70">Membros</p>
        </div>
        <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur">
          <Award size={18} className="mx-auto mb-1 text-white/80" />
          <p className="text-lg font-bold">2026</p>
          <p className="text-[10px] text-white/70">Edição</p>
        </div>
      </div>
    </div>
  )
}
