import { NextResponse } from 'next/server'
import { updateActivity, deleteActivity } from '@/lib/store'
import { getSession } from '@/lib/session'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const activity = await updateActivity(id, body)

  if (!activity) {
    return NextResponse.json({ error: 'Atividade não encontrada' }, { status: 404 })
  }

  return NextResponse.json(activity)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { id } = await params
  const ok = await deleteActivity(id)

  if (!ok) {
    return NextResponse.json({ error: 'Atividade não encontrada' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
