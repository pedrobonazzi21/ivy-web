import { NextResponse } from 'next/server'
import { getDiaryEntries, addDiaryEntry, updateDiaryEntry, deleteDiaryEntry, addActivity } from '@/lib/store'
import { getSession } from '@/lib/session'
import type { DiaryEntry } from '@/lib/types'

export async function GET() {
  return NextResponse.json(await getDiaryEntries())
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const entry: DiaryEntry = {
    id: crypto.randomUUID(),
    date: body.date ?? new Date().toISOString().split('T')[0],
    time: body.time ?? '',
    location: body.location ?? '',
    participants: body.participants ?? [],
    content: body.content,
    materials: body.materials ?? '',
    procedures: body.procedures ?? '',
    decisions: body.decisions ?? '',
    learnings: body.learnings ?? '',
    difficulties: body.difficulties ?? '',
    whatWorked: body.whatWorked ?? '',
    nextSteps: body.nextSteps ?? '',
    failedAttempts: body.failedAttempts ?? '',
    possibleCauses: body.possibleCauses ?? '',
    plannedAdjustments: body.plannedAdjustments ?? '',
    newHypotheses: body.newHypotheses ?? '',
    author: session.name,
    attachments: body.attachments ?? [],
    createdAt: new Date().toLocaleString('pt-BR'),
  }

  await addDiaryEntry(entry)
  await addActivity(session.name, 'adicionou entrada no', 'Diário de Bordo')
  return NextResponse.json(entry, { status: 201 })
}

export async function PUT(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const updated = await updateDiaryEntry(body.id, body)
  if (!updated) {
    return NextResponse.json({ error: 'Entrada não encontrada' }, { status: 404 })
  }
  await addActivity(session.name, 'editou entrada no', 'Diário de Bordo')
  return NextResponse.json(updated)
}

export async function DELETE(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { id } = await request.json()
  const entries = await getDiaryEntries()
  const entry = entries.find(e => e.id === id)
  if (!entry) {
    return NextResponse.json({ error: 'Entrada não encontrada' }, { status: 404 })
  }

  await deleteDiaryEntry(id)
  await addActivity(session.name, 'removeu entrada do', 'Diário de Bordo')
  return NextResponse.json({ success: true })
}
