'use client'

import { useState, useEffect } from 'react'
import { Users, UserPlus, Shield, UserCircle, Eye, Trash2, X, Pencil, Check } from 'lucide-react'
import type { TeamMember, Role } from '@/lib/types'
import { ROLE_LABELS } from '@/lib/types'

const ROLE_ICONS: Record<Role, typeof Shield> = {
  admin: Shield,
  colaborador: UserCircle,
  visitante: Eye,
}

export function TeamManager() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<Role>('colaborador')
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  async function loadMembers() {
    setLoading(true)
    const res = await fetch('/api/team')
    const data = await res.json()
    setMembers(data)
    setLoading(false)
  }

  useEffect(() => { loadMembers() }, [])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteName.trim() || !inviteEmail.trim()) {
      setError('Nome e email são obrigatórios')
      return
    }
    setError('')
    const res = await fetch('/api/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: inviteName.trim(), email: inviteEmail.trim(), role: inviteRole }),
    })
    if (res.ok) {
      setInviteName('')
      setInviteEmail('')
      setInviteRole('colaborador')
      setShowInvite(false)
      loadMembers()
    }
  }

  async function handleRoleChange(id: string, newRole: Role) {
    await fetch('/api/team', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, role: newRole }),
    })
    loadMembers()
  }

  async function handleSaveName(id: string) {
    if (!editName.trim()) return
    await fetch('/api/team', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name: editName.trim() }),
    })
    setEditingId(null)
    loadMembers()
  }

  async function handleRemove(id: string, name: string) {
    if (!confirm(`Remover ${name} da equipe?`)) return
    await fetch('/api/team', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    loadMembers()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
          <Users size={20} />
          Equipe ({members.length} membros)
        </h2>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-zinc-800"
        >
          <UserPlus size={16} />
          Convidar
        </button>
      </div>

      {showInvite && (
        <form onSubmit={handleInvite} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Convidar Membro</h3>
            <button type="button" onClick={() => setShowInvite(false)} className="rounded p-1 text-zinc-400 hover:bg-zinc-100">
              <X size={16} />
            </button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">Nome</label>
                <input type="text" placeholder="Nome completo"
                  value={inviteName} onChange={(e) => setInviteName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">Email</label>
                <input type="email" placeholder="email@exemplo.com"
                  value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">Permissão</label>
              <div className="flex gap-2">
                {(['admin', 'colaborador', 'visitante'] as Role[]).map(r => (
                  <button key={r} type="button" onClick={() => setInviteRole(r)}
                    className={`flex-1 rounded-lg border px-4 py-2 text-xs font-medium transition-all ${
                      inviteRole === r
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    {ROLE_LABELS[r]}
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800"
            >
              <UserPlus size={16} />
              Enviar Convite
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="py-8 text-center text-sm text-zinc-400">Carregando...</p>
      ) : (
        <div className="space-y-2">
          {members.map(member => {
            const Icon = ROLE_ICONS[member.role]
            return (
              <div key={member.id}
                className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm transition-all hover:border-zinc-300"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  {editingId === member.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(member.id); if (e.key === 'Escape') setEditingId(null) }}
                        onBlur={() => handleSaveName(member.id)}
                        className="w-full rounded-lg border border-indigo-300 px-3 py-1.5 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        autoFocus
                      />
                      <button onClick={() => handleSaveName(member.id)} className="rounded p-1 text-indigo-600 hover:bg-indigo-50">
                        <Check size={15} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-zinc-900">{member.name}</p>
                      <button onClick={() => { setEditingId(member.id); setEditName(member.name) }}
                        className="rounded p-1 text-zinc-300 hover:bg-zinc-100 hover:text-zinc-600"
                      >
                        <Pencil size={13} />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-zinc-400">{member.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value as Role)}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 outline-none focus:border-indigo-500"
                  >
                    {(['admin', 'colaborador', 'visitante'] as Role[]).map(r => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleRemove(member.id, member.name)}
                    className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
