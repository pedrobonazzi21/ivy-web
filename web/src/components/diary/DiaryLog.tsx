'use client'

import { useState, useEffect } from 'react'
import { BookOpen, FileText, Video, Code, Image, Trash2, Plus, X } from 'lucide-react'
import type { DiaryEntry } from '@/lib/types'
import { DIARY_ATTACHMENT_LABELS } from '@/lib/types'

const ATTACHMENT_ICONS: Record<string, typeof FileText> = {
  foto: Image, video: Video, codigo: Code, documento: FileText,
}

const ATTACHMENT_COLORS: Record<string, string> = {
  foto: 'text-purple-600 bg-purple-50',
  video: 'text-rose-600 bg-rose-50',
  codigo: 'text-green-600 bg-green-50',
  documento: 'text-blue-600 bg-blue-50',
}

export function DiaryLog() {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [content, setContent] = useState('')
  const [error, setError] = useState('')

  async function loadEntries() {
    setLoading(true)
    const res = await fetch('/api/diary')
    const data = await res.json()
    setEntries(data)
    setLoading(false)
  }

  useEffect(() => { loadEntries() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) {
      setError('O conteúdo é obrigatório')
      return
    }
    setError('')

    const res = await fetch('/api/diary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, content: content.trim() }),
    })

    if (res.ok) {
      setContent('')
      setShowForm(false)
      loadEntries()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover esta entrada do diário?')) return
    await fetch('/api/diary', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    loadEntries()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
          <BookOpen size={20} />
          Diário de Bordo
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-zinc-800"
        >
          <Plus size={16} />
          Nova Entrada
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Nova Entrada</h3>
            <button type="button" onClick={() => setShowForm(false)} className="rounded p-1 text-zinc-400 hover:bg-zinc-100">
              <X size={16} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">Data</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">O que aconteceu hoje?</label>
              <textarea rows={4} placeholder="Descreva as atividades, descobertas e decisões do dia..."
                value={content} onChange={(e) => { setContent(e.target.value); setError('') }}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800"
            >
              Salvar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="py-8 text-center text-sm text-zinc-400">Carregando...</p>
      ) : entries.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-400">Nenhuma entrada no diário ainda.</p>
      ) : (
        <div className="space-y-4">
          {entries.map(entry => (
            <div key={entry.id} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-1 flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-indigo-600">{entry.date}</span>
                  <p className="text-xs text-zinc-400">por {entry.author}</p>
                </div>
                <button onClick={() => handleDelete(entry.id)}
                  className="rounded p-1.5 text-zinc-300 hover:bg-red-50 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-700">{entry.content}</p>
              {entry.attachments.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {entry.attachments.map(att => {
                    const Icon = ATTACHMENT_ICONS[att.type] || FileText
                    const colorClass = ATTACHMENT_COLORS[att.type] || 'text-zinc-600 bg-zinc-50'
                    return (
                      <a key={att.id} href={att.url}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${colorClass}`}
                      >
                        <Icon size={14} />
                        {att.name}
                      </a>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
