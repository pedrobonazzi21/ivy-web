'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/projeto/tarefas', label: 'Tarefas' },
  { href: '/projeto/componentes', label: 'Componentes' },
  { href: '/projeto/arquivos', label: 'Arquivos' },
  { href: '/projeto/onedrive', label: 'OneDrive' },
  { href: '/projeto/diario', label: 'Diário' },
  { href: '/projeto/testes', label: 'Testes' },
  { href: '/projeto/febrace', label: 'FEBRACE' },
  { href: '/projeto/equipe', label: 'Equipe' },
]

type NavHeaderProps = {
  user: { name: string; role: string }
}

export function NavHeader({ user }: NavHeaderProps) {
  const pathname = usePathname()

  return (
    <header className="mb-8 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 text-sm font-bold text-white">
            I
          </div>
          <span className="text-xl font-bold text-zinc-900">IVY</span>
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          Projeto: Robô Educacional FEBRACE
        </p>
      </div>
      <div className="flex items-center gap-4">
        <nav className="hidden gap-3 text-sm md:flex">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-all ${
                pathname === item.href
                  ? 'font-medium text-indigo-600'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <p className="font-medium text-zinc-800">{user.name}</p>
            <p className="text-zinc-400">{user.role}</p>
          </div>
          <a
            href="/api/auth/logout"
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50"
          >
            Sair
          </a>
        </div>
      </div>
    </header>
  )
}
