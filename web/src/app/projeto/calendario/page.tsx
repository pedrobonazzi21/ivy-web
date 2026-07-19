'use client'

import { CalendarView } from '@/components/calendar/CalendarView'
import { CalendarPlus } from 'lucide-react'

export default function CalendarioPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="mb-8 flex items-center gap-3">
        <CalendarPlus size={24} className="text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Calendário</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Visualize eventos, prazos e atividades do projeto
          </p>
        </div>
      </div>

      <CalendarView />
    </div>
  )
}
