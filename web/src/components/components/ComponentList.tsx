'use client'

import { useState, useEffect } from 'react'
import { Package, Edit3, Trash2, Search, MessageSquare } from 'lucide-react'
import type { Component } from '@/lib/types'
import { COMPONENT_STATUS_LABELS } from '@/lib/types'
import { CommentSection } from '@/components/comments/CommentSection'

const STATUS_COLORS: Record<string, string> = {
  instalado: 'text-green-600 bg-green-50 border-green-200',
  em_estoque: 'text-blue-600 bg-blue-50 border-blue-200',
  em_compra: 'text-amber-600 bg-amber-50 border-amber-200',
  defeituoso: 'text-red-600 bg-red-50 border-red-200',
}

type ComponentListProps = {
  refreshKey: number
  onEdit: (comp: Component) => void
}

export function ComponentList({ refreshKey, onEdit }: ComponentListProps) {
  const [components, setComponents] = useState<Component[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  async function loadComponents() {
    setLoading(true)
    const res = await fetch('/api/components')
    const data = await res.json()
    setComponents(data)
    setLoading(false)
  }

  useEffect(() => { loadComponents() }, [refreshKey])

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remover componente "${name}"?`)) return
    await fetch('/api/components', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    loadComponents()
  }

  const filtered = search
    ? components.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.supplier.toLowerCase().includes(search.toLowerCase())
      )
    : components

  if (loading) {
    return <p className="py-8 text-center text-sm text-zinc-400">Carregando...</p>
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text" placeholder="Pesquisar componente..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-400">
          {search ? 'Nenhum componente encontrado' : 'Nenhum componente cadastrado'}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map(comp => {
            const isExpanded = expandedId === comp.id
            return (
              <div key={comp.id} className="rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:border-zinc-300">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <Package size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-900">{comp.name}</h4>
                        <p className="text-xs text-zinc-400">
                          {comp.supplier} &middot; R$ {comp.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setExpandedId(isExpanded ? null : comp.id) }}
                        className={`rounded-lg p-2 ${isExpanded ? 'bg-indigo-50 text-indigo-600' : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700'}`}>
                        <MessageSquare size={15} />
                      </button>
                      <button onClick={() => onEdit(comp)}
                        className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
                        <Edit3 size={15} />
                      </button>
                      <button onClick={() => handleDelete(comp.id, comp.name)}
                        className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-500">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-3 text-center text-xs">
                    <div className="rounded-lg bg-zinc-50 p-2">
                      <p className="font-medium text-zinc-900">{comp.quantity}</p>
                      <p className="text-zinc-400">Total</p>
                    </div>
                    <div className="rounded-lg bg-zinc-50 p-2">
                      <p className="font-medium text-green-600">{comp.available}</p>
                      <p className="text-zinc-400">Disponível</p>
                    </div>
                    <div className="rounded-lg bg-zinc-50 p-2">
                      <p className="font-medium text-amber-600">{comp.inUse}</p>
                      <p className="text-zinc-400">Em uso</p>
                    </div>
                    <div className="rounded-lg bg-zinc-50 p-2">
                      <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[comp.status] || ''}`}>
                        {COMPONENT_STATUS_LABELS[comp.status]}
                      </span>
                    </div>
                  </div>

                  {comp.location && (
                    <p className="mt-2 text-[11px] text-zinc-400">Localização: {comp.location}</p>
                  )}
                </div>
                {isExpanded && (
                  <div className="border-t border-zinc-100 px-5 py-4">
                    <CommentSection entityType="component" entityId={comp.id} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
