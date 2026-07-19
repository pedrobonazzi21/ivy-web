import { NextResponse } from 'next/server'
import { getChecklistItems, addChecklistItem, updateChecklistItem, updateChecklistItemDetails, deleteChecklistItem, seedChecklistIfEmpty, addActivity } from '@/lib/store'
import { getSession } from '@/lib/session'
import type { ChecklistItem } from '@/lib/types'

export async function GET() {
  await seedChecklistIfEmpty()
  return NextResponse.json(await getChecklistItems())
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const item: ChecklistItem = {
    id: crypto.randomUUID(),
    category: body.category ?? 'personalizado',
    label: body.label,
    done: false,
    responsible: body.responsible ?? '',
    notes: '',
    updatedAt: '',
    updatedBy: '',
  }

  await addChecklistItem(item)
  await addActivity(session.name, 'adicionou item no checklist', item.label)
  return NextResponse.json(item, { status: 201 })
}

export async function PUT(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await request.json()

  if (body.done !== undefined) {
    await updateChecklistItem(body.id, body.done, session.name)
    return NextResponse.json({ success: true })
  }

  await updateChecklistItemDetails(body.id, {
    label: body.label,
    category: body.category,
    responsible: body.responsible,
    notes: body.notes,
  })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { id } = await request.json()
  await deleteChecklistItem(id)
  return NextResponse.json({ success: true })
}
