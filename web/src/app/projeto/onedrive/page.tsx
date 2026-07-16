'use client'

import { useState, useEffect } from 'react'
import { Cloud } from 'lucide-react'
import { OneDriveBrowser } from '@/components/onedrive/OneDriveBrowser'
import { NavHeader } from '@/components/shared/NavHeader'
import { useRouter } from 'next/navigation'
import type { OneDriveItem } from '@/lib/onedrive/store'

export default function OneDrivePage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(d => {
        if (!d.authenticated) router.push('/')
        else setUser(d.user)
      })
  }, [router])

  async function handleImportFile(item: OneDriveItem) {
    const categoryMap: Record<string, string> = {
      '/Documentos': 'documentos',
      '/CAD': 'cad',
      '/Código': 'codigo',
      '/Fotos': 'fotos',
      '/Vídeos': 'videos',
      '/Relatórios': 'documentos',
      '/Apresentações': 'documentos',
    }

    const parentPath = '/' + item.path.split('/').slice(1, -1).join('/')
    const category = categoryMap[parentPath] || 'documentos'

    const res = await fetch('/api/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: item.name,
        category,
        url: item.webUrl || item.downloadUrl || '',
      }),
    })

    await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'importou do OneDrive', target: item.name }),
    })

    if (res.ok) {
      router.push('/projeto/arquivos')
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-500">
        Carregando...
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <NavHeader user={user} />

      <div className="mb-8 flex items-center gap-3">
        <Cloud size={24} className="text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">OneDrive</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Navegue pelos arquivos do OneDrive e importe para o projeto
          </p>
        </div>
      </div>

      <OneDriveBrowser onImportFile={handleImportFile} />
    </div>
  )
}
