'use client'

import { useState, useEffect } from 'react'
import { KanbanBoard } from '@/components/tasks/KanbanBoard'
import { useRouter } from 'next/navigation'

export default function TarefasPage() {
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

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-500">
        Carregando...
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Tarefas</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Gerencie as tarefas do projeto com o quadro Kanban
        </p>
      </div>

      <KanbanBoard />
    </div>
  )
}
