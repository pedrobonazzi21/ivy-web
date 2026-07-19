'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, Plus, X, Trash2 } from 'lucide-react'
import type { CalendarEvent, CalendarEventType } from '@/lib/types'
import { CALENDAR_EVENT_LABELS, CALENDAR_EVENT_COLORS } from '@/lib/types'

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState<string | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formType, setFormType] = useState<CalendarEventType>('reuniao')
  const [formDesc, setFormDesc] = useState('')

  async function loadEvents() {
    const res = await fetch('/api/calendar')
    setEvents(await res.json())
    setLoading(false)
  }

  useEffect(() => { loadEvents() }, [])

  async function handleAddEvent(e: React.FormEvent) {
    e.preventDefault()
    if (!formTitle.trim() || !showForm) return
    await fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: formTitle.trim(), date: showForm, type: formType, description: formDesc.trim() }),
    })
    setFormTitle('')
    setFormDesc('')
    setShowForm(null)
    loadEvents()
  }

  async function handleDeleteEvent(id: string) {
    await fetch('/api/calendar', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    loadEvents()
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startOffset = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  function prevMonth() { setCurrentDate(new Date(year, month - 1, 1)) }
  function nextMonth() { setCurrentDate(new Date(year, month + 1, 1)) }

  function getEventsForDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.date === dateStr)
  }

  const days: (number | null)[] = []
  for (let i = 0; i < startOffset; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)
  while (days.length % 7 !== 0) days.push(null)

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          <CalendarDays size={16} />
          Calendário
        </h3>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="rounded p-1 text-zinc-400 hover:bg-zinc-100"><ChevronLeft size={18} /></button>
          <span className="text-sm font-semibold text-zinc-800">{MONTHS[month]} {year}</span>
          <button onClick={nextMonth} className="rounded p-1 text-zinc-400 hover:bg-zinc-100"><ChevronRight size={18} /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px">
        {WEEKDAYS.map(d => (
          <div key={d} className="py-1.5 text-center text-[11px] font-medium text-zinc-400">{d}</div>
        ))}
        {days.map((day, i) => {
          if (day === null) return <div key={i} />
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayEvents = getEventsForDay(day)
          const isToday = dateStr === todayStr

          return (
            <div key={i} className={`min-h-[72px] rounded-lg border p-1 text-xs transition-all ${
              isToday ? 'border-indigo-500 bg-indigo-50' : 'border-transparent hover:bg-zinc-50'
            }`}>
              <button onClick={() => setShowForm(dateStr)} className={`mb-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-medium ${
                isToday ? 'bg-indigo-600 text-white' : 'text-zinc-600 hover:bg-zinc-200'
              }`}>
                {day}
              </button>
              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 2).map(e => (
                  <button key={e.id} onClick={() => handleDeleteEvent(e.id)}
                    className={`flex w-full items-center gap-1 rounded px-1 py-0.5 text-left ${CALENDAR_EVENT_COLORS[e.type]} bg-opacity-20 hover:bg-opacity-40 group`}
                  >
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${CALENDAR_EVENT_COLORS[e.type]}`} />
                    <span className="truncate text-[9px] font-medium text-zinc-700 group-hover:line-through group-hover:text-red-500">{e.title}</span>
                  </button>
                ))}
                {dayEvents.length > 2 && (
                  <span className="text-[9px] text-zinc-400 px-1">+{dayEvents.length - 2} mais</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {(Object.entries(CALENDAR_EVENT_LABELS) as [string, string][]).map(([type, label]) => (
          <div key={type} className="flex items-center gap-1.5 text-[10px] text-zinc-500">
            <span className={`h-2 w-2 rounded-full ${CALENDAR_EVENT_COLORS[type as keyof typeof CALENDAR_EVENT_COLORS]}`} />
            {label}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowForm(null)}>
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Novo Evento</h3>
              <button onClick={() => setShowForm(null)} className="rounded p-1 text-zinc-400 hover:bg-zinc-100">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">Data</label>
                <input type="date" value={showForm} readOnly
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-500 outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">Título</label>
                <input type="text" placeholder="Nome do evento" value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">Tipo</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(CALENDAR_EVENT_LABELS) as [CalendarEventType, string][]).map(([type, label]) => (
                    <button key={type} type="button" onClick={() => setFormType(type)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                        formType === type
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">Descrição (opcional)</label>
                <textarea rows={2} placeholder="Descrição..." value={formDesc} onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
                />
              </div>
              <button type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800"
              >
                <Plus size={16} />
                Adicionar Evento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
