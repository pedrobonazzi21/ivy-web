'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/shared/Sidebar'
import { NotificationBell } from '@/components/shared/NotificationBell'
import { PageGuard } from '@/components/shared/PageGuard'

export default function ProjetoLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(d => {
        if (!d.authenticated) router.push('/')
        else setAuthed(true)
      })
  }, [router])

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-500">
        Carregando...
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        <div className="fixed right-6 top-4 z-30">
          <NotificationBell />
        </div>
        <PageGuard>
          {children}
        </PageGuard>
      </main>
    </div>
  )
}
