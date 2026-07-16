'use client'

import { useState } from 'react'
import { Upload, FileText, Box, Code, Image, Video, Cloud } from 'lucide-react'
import { CATEGORIES } from '@/lib/store'
import Link from 'next/link'

type FileUploadProps = {
  onUploaded: () => void
}

const ICON_MAP: Record<string, typeof FileText> = {
  FileText, Box, Code, Image, Video,
}

export function FileUpload({ onUploaded }: FileUploadProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('documentos')
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Nome do arquivo é obrigatório')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), category, size: 0, url: url.trim() }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Erro ao enviar')
        return
      }

      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'anexou arquivo', target: name.trim() }),
      })

      setName('')
      setUrl('')
      onUploaded()
    } catch {
      setError('Erro ao enviar arquivo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
        <Upload size={16} />
        Adicionar Arquivo
      </h3>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Nome do arquivo</label>
          <input
            type="text"
            placeholder="ex: datasheet.pdf"
            value={name}
            onChange={(e) => { setName(e.target.value); setError('') }}
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Categoria</label>
          <div className="grid grid-cols-5 gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = ICON_MAP[cat.icon] || FileText
              const isActive = category === cat.value
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-xs transition-all ${
                    isActive
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  <Icon size={18} />
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">URL / Link (opcional)</label>
          <input
            type="text"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800 disabled:opacity-50"
        >
          <Upload size={16} />
          {loading ? 'Enviando...' : 'Adicionar Arquivo'}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-zinc-400">ou</span>
          </div>
        </div>

        <Link
          href="/projeto/onedrive"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-6 py-3 text-sm font-semibold text-indigo-700 transition-all hover:bg-indigo-100"
        >
          <Cloud size={16} />
          Importar do OneDrive
        </Link>
      </div>
    </form>
  )
}
