'use client'

import { useState, useEffect } from 'react'
import { Cloud } from 'lucide-react'
import { GoogleDriveBrowser } from '@/components/google/GoogleDriveBrowser'
import { GoogleDriveViewer } from '@/components/google/GoogleDriveViewer'
import { useRouter } from 'next/navigation'

export default function GoogleDrivePage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)
  const [tab, setTab] = useState<'arquivos' | 'visualizar'>('arquivos')

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(d => {
        if (!d.authenticated) router.push('/')
        else setUser(d.user)
      })
  }, [router])

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-500">
        Carregando...
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Cloud size={24} className="text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Google Drive</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Vincule documentos do Google Drive e sincronize alterações automaticamente
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        <button onClick={() => setTab('arquivos')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            tab === 'arquivos' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}>
          Arquivos do Drive
        </button>
        <button onClick={() => setTab('visualizar')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            tab === 'visualizar' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}>
          Documentos Sincronizados
        </button>
      </div>

      {tab === 'arquivos' ? <GoogleDriveBrowser /> : <GoogleDriveViewer />}
    </div>
  )
}
