'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import type { CalendarEvent } from '@/lib/types'
import { CALENDAR_EVENT_LABELS, CALENDAR_EVENT_COLORS } from '@/lib/types'

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/calendar')
      .then(res => res.json())
      .then(data => { setEvents(data); setLoading(false) })
  }, [])

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
              <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-medium ${
                isToday ? 'bg-indigo-600 text-white' : 'text-zinc-600'
              }`}>
                {day}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 2).map(e => (
                  <div key={e.id} className={`flex items-center gap-1 rounded px-1 py-0.5 ${CALENDAR_EVENT_COLORS[e.type]} bg-opacity-20`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${CALENDAR_EVENT_COLORS[e.type]}`} />
                    <span className="truncate text-[9px] font-medium text-zinc-700">{e.title}</span>
                  </div>
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
    </div>
  )
}
