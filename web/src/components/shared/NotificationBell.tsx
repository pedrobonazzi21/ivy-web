'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, BellDot, Check, ChevronRight, Loader } from 'lucide-react'
import type { Notification } from '@/lib/types'
import Link from 'next/link'

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  async function load() {
    const res = await fetch('/api/notifications')
    const data = await res.json()
    setNotifications(data.notifications)
    setUnreadCount(data.unreadCount)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleMarkAllRead() {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    })
    load()
  }

  async function handleMarkRead(id: string) {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  const TYPE_COLORS: Record<string, string> = {
    task_assigned: 'bg-sky-500',
    deadline: 'bg-red-500',
    checklist: 'bg-green-500',
    team: 'bg-purple-500',
    system: 'bg-zinc-500',
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-zinc-500 transition-all hover:bg-zinc-100"
      >
        {unreadCount > 0 ? <BellDot size={18} /> : <Bell size={18} />}
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-zinc-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Notificações</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-6"><Loader size={16} className="animate-spin text-zinc-400" /></div>
            ) : notifications.length === 0 ? (
              <p className="py-6 text-center text-sm text-zinc-400">Nenhuma notificação</p>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`flex items-start gap-3 px-4 py-3 text-sm transition-all hover:bg-zinc-50 ${n.read ? '' : 'bg-indigo-50/40'}`}>
                  <div className="mt-1">
                    <div className={`h-2 w-2 rounded-full ${TYPE_COLORS[n.type] ?? 'bg-zinc-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${n.read ? 'text-zinc-600' : 'font-medium text-zinc-900'}`}>
                      {n.title}
                    </p>
                    {n.message && (
                      <p className="mt-0.5 text-xs text-zinc-400 truncate">{n.message}</p>
                    )}
                    <p className="mt-0.5 text-[10px] text-zinc-400">{n.createdAt}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {n.link && (
                      <Link href={n.link} className="rounded p-1 text-zinc-400 hover:text-indigo-600" onClick={() => setOpen(false)}>
                        <ChevronRight size={14} />
                      </Link>
                    )}
                    {!n.read && (
                      <button onClick={() => handleMarkRead(n.id)} className="rounded p-1 text-zinc-400 hover:text-green-600">
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
