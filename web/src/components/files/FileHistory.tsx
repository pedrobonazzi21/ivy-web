'use client'

import { useState, useEffect } from 'react'
import { History, Clock, User } from 'lucide-react'
import type { FileVersion } from '@/lib/types'

type FileHistoryProps = {
  fileId: string
  fileName: string
}

export function FileHistory({ fileId, fileName }: FileHistoryProps) {
  const [versions, setVersions] = useState<FileVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const res = await fetch(`/api/files/versions?fileId=${fileId}`)
      const data = await res.json()
      setVersions(data)
      setLoading(false)
    }
    load()
  }, [fileId])

  const display = showAll ? versions : versions.slice(0, 3)

  return (
    <div>
      <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
        <History size={14} />
        Histórico de Versões
      </h4>

      {loading ? (
        <p className="text-xs text-zinc-400">Carregando...</p>
      ) : versions.length === 0 ? (
        <p className="text-xs text-zinc-400">Nenhuma versão registrada.</p>
      ) : (
        <div className="space-y-1.5">
          {display.map(v => (
            <div key={v.id} className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-100 text-[10px] font-bold text-indigo-700">
                {v.version}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-zinc-700">
                  {v.editedBy}
                </p>
                <p className="text-[10px] text-zinc-400">{v.editedAt}</p>
              </div>
              {v.description && (
                <span className="text-[10px] text-zinc-500 truncate max-w-[120px]">{v.description}</span>
              )}
            </div>
          ))}
          {versions.length > 3 && !showAll && (
            <button onClick={() => setShowAll(true)}
              className="text-xs text-indigo-600 hover:underline">
              Ver todas ({versions.length} versões)
            </button>
          )}
        </div>
      )}
    </div>
  )
}
