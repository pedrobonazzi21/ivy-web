'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Package } from 'lucide-react'
import type { Component } from '@/lib/types'

export function StockAlert() {
  const [lowStock, setLowStock] = useState<Component[]>([])

  useEffect(() => {
    fetch('/api/components')
      .then(res => res.json())
      .then((data: Component[]) => {
        setLowStock(data.filter(c => c.available <= 2 && c.available > 0))
      })
  }, [])

  if (lowStock.length === 0) return null

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="mb-2 flex items-center gap-2">
        <AlertTriangle size={16} className="text-amber-600" />
        <h3 className="text-sm font-semibold text-amber-800">Estoque Baixo</h3>
      </div>
      <div className="space-y-1">
        {lowStock.map(c => (
          <div key={c.id} className="flex items-center gap-2 text-xs text-amber-700">
            <Package size={12} />
            <span className="font-medium">{c.name}</span>
            <span className="text-amber-500">— apenas {c.available} disponível(is)</span>
          </div>
        ))}
      </div>
    </div>
  )
}
