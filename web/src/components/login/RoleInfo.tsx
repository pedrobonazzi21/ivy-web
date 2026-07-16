'use client'

import { Shield, UserCircle, Eye } from 'lucide-react'
import type { Role } from '@/lib/types'
import { ROLE_LABELS, ROLE_PERMISSIONS } from '@/lib/types'

const ROLE_ICONS: Record<Role, typeof Shield> = {
  admin: Shield,
  colaborador: UserCircle,
  visitante: Eye,
}

export function RoleInfo() {
  const roles: Role[] = ['admin', 'colaborador', 'visitante']

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Permissões</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        {roles.map((role) => {
          const Icon = ROLE_ICONS[role]
          const can = ROLE_PERMISSIONS[role]
          return (
            <div
              key={role}
              className="rounded-lg border border-zinc-200 bg-white p-4"
            >
              <div className="mb-3 flex items-center gap-2">
                <Icon size={18} className="text-indigo-600" />
                <span className="font-semibold text-zinc-900">{ROLE_LABELS[role]}</span>
              </div>
              <ul className="space-y-1">
                {can.map((perm) => (
                  <li key={perm} className="flex items-start gap-1.5 text-xs text-zinc-600">
                    <span className="mt-0.5 text-indigo-500">•</span>
                    {perm}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
