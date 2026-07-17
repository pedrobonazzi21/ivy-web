'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, Box, Code, Image, Video } from 'lucide-react'
import { CATEGORIES } from '@/lib/store'
import { uploadFile, auth } from '@/lib/firebase'

type FileUploadProps = {
  onUploaded: () => void
}

const ICON_MAP: Record<string, typeof FileText> = {
  FileText, Box, Code, Image, Video,
}

export function FileUpload({ onUploaded }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [category, setCategory] = useState('documentos')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      setError('Selecione um arquivo')
      return
    }
    if (!auth.currentUser) {
      setError('Faça login novamente')
      return
    }

    setLoading(true)
    setError('')

    try {
      const path = `projetos/ivy/${category}/${Date.now()}_${file.name}`
      const url = await uploadFile(file, path, (pct) => setProgress(Math.round(pct)))

      const res = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: file.name,
          category,
          size: file.size,
          url,
        }),
      })

      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Erro ao enviar')
        return
      }

      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'anexou arquivo', target: file.name }),
      })

      setFile(null)
      setProgress(0)
      if (inputRef.current) inputRef.current.value = ''
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
        Upload de Arquivo
      </h3>

      <div className="space-y-4">
        <div
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 p-6 transition-all hover:border-indigo-400 hover:bg-indigo-50"
        >
          <Upload size={32} className="text-zinc-300 mb-2" />
          <p className="text-sm font-medium text-zinc-600">
            {file ? file.name : 'Clique para selecionar um arquivo'}
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Qualquer formato'}
          </p>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(e) => { setFile(e.target.files?.[0] || null); setError('') }}
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

        {loading && progress > 0 && (
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
              <span>Enviando...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading || !file}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800 disabled:opacity-50"
        >
          <Upload size={16} />
          {loading ? 'Enviando...' : 'Fazer Upload'}
        </button>
      </div>
    </form>
  )
}
