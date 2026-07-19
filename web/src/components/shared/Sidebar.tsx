'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, LayoutDashboard, ClipboardList, Wrench, FolderOpen, FlaskConical, Trophy, Users, CalendarDays, Target, ClipboardCheck } from 'lucide-react'

type NavSection = {
  label: string
  icon: React.ReactNode
  items: { href: string; label: string }[]
}

const SECTIONS: NavSection[] = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard size={16} />,
    items: [{ href: '/dashboard', label: 'Visão Geral' }],
  },
  {
    label: 'Planejamento',
    icon: <ClipboardList size={16} />,
    items: [
      { href: '/projeto/tarefas', label: 'Kanban' },
      { href: '/projeto/calendario', label: 'Calendário' },
      { href: '/projeto/metas', label: 'Metas' },
      { href: '/projeto/checklist', label: 'Checklist' },
    ],
  },
  {
    label: 'Recursos',
    icon: <Wrench size={16} />,
    items: [{ href: '/projeto/componentes', label: 'Componentes' }],
  },
  {
    label: 'Documentação',
    icon: <FolderOpen size={16} />,
    items: [
      { href: '/projeto/arquivos', label: 'Arquivos' },
      { href: '/projeto/google', label: 'Google Drive' },
      { href: '/projeto/diario', label: 'Diário de Bordo' },
    ],
  },
  {
    label: 'Validação',
    icon: <FlaskConical size={16} />,
    items: [{ href: '/projeto/testes', label: 'Testes' }],
  },
  {
    label: 'FEBRACE',
    icon: <Trophy size={16} />,
    items: [
      { href: '/projeto/febrace', label: 'Dados da Competição' },
      { href: '/projeto/exportar-pdf', label: 'Exportar PDF' },
    ],
  },
  {
    label: 'Equipe',
    icon: <Users size={16} />,
    items: [{ href: '/projeto/equipe', label: 'Membros' }],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg border border-zinc-200 bg-white p-2 shadow-sm lg:hidden"
      >
        <Menu size={20} />
      </button>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <aside className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-zinc-200 bg-white transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 text-xs font-bold text-white">
              I
            </div>
            <span className="text-base font-bold text-zinc-900">IVY</span>
          </Link>
          <button onClick={() => setOpen(false)} className="rounded p-1 text-zinc-400 hover:bg-zinc-100 lg:hidden">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {SECTIONS.map(section => {
            const sectionActive = section.items.some(i => isActive(i.href))
            return (
              <div key={section.label} className="mb-5">
                <div className={`mb-1 flex items-center gap-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider ${sectionActive ? 'text-indigo-600' : 'text-zinc-400'}`}>
                  {section.icon}
                  {section.label}
                </div>
                {section.items.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all ${
                      isActive(item.href)
                        ? 'bg-indigo-50 font-medium text-indigo-700'
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )
          })}
        </nav>

        <div className="border-t border-zinc-200 px-5 py-3 text-[11px] text-zinc-400">
          Projeto: Robô Educacional FEBRACE
        </div>
      </aside>
    </>
  )
}
