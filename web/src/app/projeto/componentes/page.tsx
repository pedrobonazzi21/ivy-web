'use client'

import { useState, useEffect } from 'react'
import { Package, Plus } from 'lucide-react'
import { ComponentList } from '@/components/components/ComponentList'
import { ComponentForm } from '@/components/components/ComponentForm'
import { StockAlert } from '@/components/components/StockAlert'
import { useRouter } from 'next/navigation'
import type { Component } from '@/lib/types'

export default function ComponentesPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editComponent, setEditComponent] = useState<Component | null>(null)
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

  function handleSaved() {
    setShowForm(false)
    setEditComponent(null)
    setRefreshKey(k => k + 1)
  }

  function handleEdit(comp: Component) {
    setEditComponent(comp)
    setShowForm(true)
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Componentes</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Controle de componentes e estoque inteligente
          </p>
        </div>
        <button
          onClick={() => { setEditComponent(null); setShowForm(!showForm) }}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-zinc-800"
        >
          <Plus size={16} />
          {showForm ? 'Fechar' : 'Adicionar'}
        </button>
      </div>

      <StockAlert />

      <div className="mt-6 grid gap-8 lg:grid-cols-5">
        {showForm && (
          <div className="lg:col-span-2">
            <ComponentForm
              onSaved={handleSaved}
              onCancel={() => { setShowForm(false); setEditComponent(null) }}
              editComponent={editComponent}
            />
          </div>
        )}
        <div className={showForm ? 'lg:col-span-3' : 'lg:col-span-5'}>
          <ComponentList refreshKey={refreshKey} onEdit={handleEdit} />
        </div>
      </div>
    </div>
  )
}
