'use client'

import { useState, useEffect } from 'react'
import { FileUpload } from '@/components/files/FileUpload'
import { FileList } from '@/components/files/FileList'
import { NavHeader } from '@/components/shared/NavHeader'
import { useRouter } from 'next/navigation'

export default function ArquivosPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

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
      <NavHeader user={user} />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Arquivos</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Gerencie os arquivos do projeto por categoria
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <FileUpload onUploaded={() => setRefreshKey(k => k + 1)} />
        </div>
        <div className="lg:col-span-3">
          <FileList key={refreshKey} />
        </div>
      </div>
    </div>
  )
}
