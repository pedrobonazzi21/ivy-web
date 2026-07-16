'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'

type TaskFormProps = {
  onCreated: () => void
  onCancel: () => void
}

export function TaskForm({ onCreated, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [responsible, setResponsible] = useState('')
  const [priority, setPriority] = useState('media')
  const [deadline, setDeadline] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Título é obrigatório')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          responsible: responsible.trim(),
          priority,
          deadline,
        }),
      })

      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Erro ao criar tarefa')
        return
      }

      onCreated()
    } catch {
      setError('Erro ao criar tarefa')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          <Plus size={16} />
          Nova Tarefa
        </h3>
        <button type="button" onClick={onCancel} className="rounded p-1 text-zinc-400 hover:bg-zinc-100">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Título *</label>
          <input
            type="text" placeholder="Ex: Modelar Garra"
            value={title} onChange={(e) => { setTitle(e.target.value); setError('') }}
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Descrição</label>
          <textarea
            placeholder="Descreva a tarefa..."
            value={description} onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Responsável</label>
            <input
              type="text" placeholder="Nome"
              value={responsible} onChange={(e) => setResponsible(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Prazo</label>
            <input
              type="date"
              value={deadline} onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Prioridade</label>
          <div className="flex gap-2">
            {['baixa', 'media', 'alta'].map(p => (
              <button
                key={p} type="button"
                onClick={() => setPriority(p)}
                className={`flex-1 rounded-lg border px-4 py-2 text-xs font-medium transition-all ${
                  priority === p
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {p === 'baixa' ? 'Baixa' : p === 'media' ? 'Média' : 'Alta'}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit" disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? 'Criando...' : 'Criar Tarefa'}
        </button>
      </div>
    </form>
  )
}
