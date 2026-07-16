'use client'

import { useState, useEffect } from 'react'
import { FileText, Box, Code, Image, Video, Trash2, Download, History, MessageSquare } from 'lucide-react'
import type { FileEntry } from '@/lib/store'
import { CATEGORIES } from '@/lib/store'
import { FileHistory } from './FileHistory'
import { CommentSection } from '@/components/comments/CommentSection'

const ICON_MAP: Record<string, typeof FileText> = {
  FileText, Box, Code, Image, Video,
}

const CATEGORY_COLORS: Record<string, string> = {
  documentos: 'text-blue-600 bg-blue-50',
  cad: 'text-orange-600 bg-orange-50',
  codigo: 'text-green-600 bg-green-50',
  fotos: 'text-purple-600 bg-purple-50',
  videos: 'text-rose-600 bg-rose-50',
}

export function FileList() {
  const [files, setFiles] = useState<FileEntry[]>([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [tab, setTab] = useState<'versoes' | 'comentarios'>('versoes')

  async function loadFiles() {
    setLoading(true)
    const res = await fetch('/api/files')
    const data = await res.json()
    setFiles(data)
    setLoading(false)
  }

  useEffect(() => { loadFiles() }, [])

  async function handleDelete(id: string, name: string) {
    await fetch('/api/files', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'removeu arquivo', target: name }),
    })
    loadFiles()
  }

  const filtered = filter
    ? files.filter(f => f.category === filter)
    : files

  const getCategoryLabel = (value: string) =>
    CATEGORIES.find(c => c.value === value)?.label ?? value

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setFilter('')}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            !filter ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}>Todos</button>
        {CATEGORIES.map(cat => (
          <button key={cat.value} onClick={() => setFilter(cat.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              filter === cat.value ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}>{cat.label}</button>
        ))}
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-zinc-400">Carregando...</p>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-400">Nenhum arquivo encontrado</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(file => {
            const Icon = ICON_MAP[CATEGORIES.find(c => c.value === file.category)?.icon ?? 'FileText'] || FileText
            const colorClass = CATEGORY_COLORS[file.category] || 'text-zinc-600 bg-zinc-50'
            const isExpanded = expandedId === file.id

            return (
              <div key={file.id} className="rounded-lg border border-zinc-200 bg-white shadow-sm">
                <div className="flex items-center gap-4 px-4 py-3 transition-all hover:border-zinc-300">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClass}`}>
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900">{file.name}</p>
                    <p className="text-xs text-zinc-400">
                      {file.uploadedBy} &middot; {file.uploadedAt} &middot; {getCategoryLabel(file.category)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {file.url && (
                      <a href={file.url} target="_blank" rel="noopener noreferrer"
                        className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
                        <Download size={16} />
                      </a>
                    )}
                    <button onClick={() => { setExpandedId(isExpanded ? null : file.id); setTab('versoes') }}
                      className={`rounded-lg p-2 ${isExpanded ? 'bg-indigo-50 text-indigo-600' : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700'}`}>
                      <History size={16} />
                    </button>
                    <button onClick={() => { setExpandedId(isExpanded ? null : file.id); setTab('comentarios') }}
                      className={`rounded-lg p-2 ${isExpanded && tab === 'comentarios' ? 'bg-indigo-50 text-indigo-600' : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700'}`}>
                      <MessageSquare size={16} />
                    </button>
                    <button onClick={() => handleDelete(file.id, file.name)}
                      className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-zinc-100 px-5 py-4">
                    {tab === 'versoes' ? (
                      <FileHistory fileId={file.id} fileName={file.name} />
                    ) : (
                      <CommentSection entityType="file" entityId={file.id} />
                    )}
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
