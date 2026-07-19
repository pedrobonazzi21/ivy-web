'use client'

import { useState, useEffect, useCallback } from 'react'
import { Clock, Pencil, Trash2, Check, X, Loader } from 'lucide-react'
import type { Activity } from '@/lib/types'

type ActivityTimelineProps = {
  initialActivities: Activity[]
  totalActivities?: number
  refreshInterval?: number
}

export function ActivityTimeline({ initialActivities, totalActivities, refreshInterval = 0 }: ActivityTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(!!(totalActivities && totalActivities > initialActivities.length))
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAction, setEditAction] = useState('')
  const [editTarget, setEditTarget] = useState('')

  useEffect(() => {
    setActivities(initialActivities)
  }, [initialActivities])

  useEffect(() => {
    if (!refreshInterval) return
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/activities?page=1&pageSize=${activities.length}`)
        const data = await res.json()
        if (data.activities) setActivities(data.activities)
        else if (Array.isArray(data)) setActivities(data.slice(0, activities.length))
      } catch { /* ignore */ }
    }, refreshInterval)
    return () => clearInterval(id)
  }, [refreshInterval, activities.length])

  const loadMore = useCallback(async () => {
    setLoading(true)
    try {
      const nextPage = page + 1
      const res = await fetch(`/api/activities?page=${nextPage}&pageSize=10`)
      const data = await res.json()
      const newActivities = data.activities ?? []
      setActivities(prev => [...prev, ...newActivities])
      setPage(nextPage)
      if (newActivities.length < 10) setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [page])

  async function handleDelete(id: string) {
    const res = await fetch(`/api/activities/${id}`, { method: 'DELETE' })
    if (res.ok) setActivities(prev => prev.filter(a => a.id !== id))
  }

  function startEdit(activity: Activity) {
    setEditingId(activity.id)
    setEditAction(activity.action)
    setEditTarget(activity.target)
  }

  async function saveEdit(id: string) {
    const res = await fetch(`/api/activities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: editAction, target: editTarget }),
    })
    if (res.ok) {
      const updated = await res.json()
      setActivities(prev => prev.map(a => a.id === id ? updated : a))
      setEditingId(null)
    }
  }

  function cancelEdit() {
    setEditingId(null)
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
        <Clock size={16} />
        Linha do Tempo
        {totalActivities !== undefined && (
          <span className="ml-auto text-xs font-normal text-zinc-400">{totalActivities} registros</span>
        )}
      </h3>
      <div className="space-y-0">
        {activities.map((activity, i) => (
          <div key={activity.id} className="group relative flex gap-4 pb-4 last:pb-0">
            {i < activities.length - 1 && (
              <div className="absolute left-[7px] top-4 h-full w-px bg-zinc-200" />
            )}
            <div className="mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-indigo-500 bg-white" />
            <div className="min-w-0 flex-1">
              {editingId === activity.id ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      value={editAction}
                      onChange={e => setEditAction(e.target.value)}
                      className="flex-1 rounded border border-zinc-300 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                    />
                    <input
                      value={editTarget}
                      onChange={e => setEditTarget(e.target.value)}
                      className="flex-1 rounded border border-zinc-300 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => saveEdit(activity.id)}
                      className="flex items-center gap-1 rounded bg-green-500 px-2 py-1 text-xs text-white hover:bg-green-600">
                      <Check size={12} /> Salvar
                    </button>
                    <button onClick={cancelEdit}
                      className="flex items-center gap-1 rounded bg-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-400">
                      <X size={12} /> Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-zinc-800">
                    <span className="font-medium">{activity.user}</span>{' '}
                    {activity.action}{' '}
                    <span className="font-medium text-indigo-600">{activity.target}</span>
                  </p>
                  <p className="text-xs text-zinc-400">{activity.timestamp}</p>
                </>
              )}
            </div>
            {editingId !== activity.id && (
              <div className="hidden gap-1 group-hover:flex">
                <button onClick={() => startEdit(activity)}
                  className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(activity.id)}
                  className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {hasMore && (
        <button onClick={loadMore} disabled={loading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50">
          {loading ? <Loader size={16} className="animate-spin" /> : null}
          {loading ? 'Carregando...' : 'Mostrar mais'}
        </button>
      )}
    </div>
  )
}
