'use client'

import { useState, useEffect } from 'react'
import { Package, X } from 'lucide-react'
import type { Component } from '@/lib/types'
import { COMPONENT_STATUS_LABELS } from '@/lib/types'

type ComponentFormProps = {
  onSaved: () => void
  onCancel: () => void
  editComponent?: Component | null
}

export function ComponentForm({ onSaved, onCancel, editComponent }: ComponentFormProps) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(0)
  const [supplier, setSupplier] = useState('')
  const [price, setPrice] = useState(0)
  const [status, setStatus] = useState<string>('em_estoque')
  const [location, setLocation] = useState('')
  const [datasheetUrl, setDatasheetUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editComponent) {
      setName(editComponent.name)
      setQuantity(editComponent.quantity)
      setSupplier(editComponent.supplier)
      setPrice(editComponent.price)
      setStatus(editComponent.status)
      setLocation(editComponent.location)
      setDatasheetUrl(editComponent.datasheetUrl)
    }
  }, [editComponent])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Nome é obrigatório')
      return
    }
    setLoading(true)
    setError('')

    try {
      const body = {
        name: name.trim(),
        quantity,
        available: editComponent ? undefined : quantity,
        supplier: supplier.trim(),
        price,
        status,
        location: location.trim(),
        datasheetUrl: datasheetUrl.trim(),
      }

      let res
      if (editComponent) {
        res = await fetch('/api/components', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editComponent.id, ...body }),
        })
      } else {
        res = await fetch('/api/components', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }

      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Erro ao salvar')
        return
      }

      onSaved()
    } catch {
      setError('Erro ao salvar componente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          <Package size={16} />
          {editComponent ? 'Editar Componente' : 'Novo Componente'}
        </h3>
        <button type="button" onClick={onCancel} className="rounded p-1 text-zinc-400 hover:bg-zinc-100">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Nome *</label>
          <input type="text" placeholder="Ex: ESP32"
            value={name} onChange={(e) => { setName(e.target.value); setError('') }}
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Quantidade</label>
            <input type="number" min={0}
              value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Preço (R$)</label>
            <input type="number" min={0} step="0.01"
              value={price} onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Fornecedor</label>
          <input type="text" placeholder="Ex: Baú da Eletrônica"
            value={supplier} onChange={(e) => setSupplier(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              {Object.entries(COMPONENT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Localização</label>
            <input type="text" placeholder="Ex: Caixa A"
              value={location} onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Datasheet (URL)</label>
          <input type="text" placeholder="https://..."
            value={datasheetUrl} onChange={(e) => setDatasheetUrl(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button type="submit" disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : editComponent ? 'Salvar Alterações' : 'Adicionar Componente'}
        </button>
      </div>
    </form>
  )
}
