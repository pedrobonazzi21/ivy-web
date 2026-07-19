'use client'

import { FileDown, ClipboardCheck, Award, CalendarDays, Target } from 'lucide-react'
import Link from 'next/link'

const EXPORT_OPTIONS = [
  {
    title: 'Checklist FEBRACE',
    description: 'Veja o progresso da submissão FEBRACE',
    icon: ClipboardCheck,
    href: '/projeto/checklist',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    title: 'Dados da Competição',
    description: 'Painel completo com estatísticas do projeto',
    icon: Award,
    href: '/projeto/febrace',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    title: 'Calendário',
    description: 'Visualize eventos e prazos do projeto',
    icon: CalendarDays,
    href: '/projeto/calendario',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    title: 'Metas',
    description: 'Acompanhe o progresso dos objetivos',
    icon: Target,
    href: '/projeto/metas',
    color: 'text-sky-600',
    bg: 'bg-sky-50',
  },
]

export default function ExportarPDFPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      <div className="mb-8 flex items-center gap-3">
        <FileDown size={24} className="text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Exportar</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Acesse relatórios, checklists e dados do projeto para exportação
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {EXPORT_OPTIONS.map(opt => (
          <Link key={opt.href} href={opt.href}
            className="group rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
          >
            <div className={`mb-4 inline-flex rounded-lg p-3 ${opt.bg}`}>
              <opt.icon size={24} className={opt.color} />
            </div>
            <h3 className="mb-1 font-semibold text-zinc-900 group-hover:text-indigo-600 transition-colors">
              {opt.title}
            </h3>
            <p className="text-sm text-zinc-500">{opt.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
