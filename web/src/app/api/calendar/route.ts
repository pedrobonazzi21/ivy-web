import { NextResponse } from 'next/server'
import { getCalendarEvents, addCalendarEvent, deleteCalendarEvent, addActivity } from '@/lib/store'
import { getSession } from '@/lib/session'
import type { CalendarEvent } from '@/lib/types'

export async function GET() {
  return NextResponse.json(await getCalendarEvents())
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const event: CalendarEvent = {
    id: crypto.randomUUID(),
    title: body.title,
    date: body.date,
    type: body.type ?? 'reuniao',
    description: body.description ?? '',
  }

  await addCalendarEvent(event)
  await addActivity(session.name, 'criou evento', event.title)
  return NextResponse.json(event, { status: 201 })
}

export async function DELETE(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { id } = await request.json()
  await deleteCalendarEvent(id)
  return NextResponse.json({ success: true })
}
