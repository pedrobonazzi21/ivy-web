import { NextResponse } from 'next/server'
import { getComments, addComment, addActivity } from '@/lib/store'
import { getSession } from '@/lib/session'
import type { Comment } from '@/lib/types'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const entityType = searchParams.get('entityType')
  const entityId = searchParams.get('entityId')
  if (!entityType || !entityId) {
    return NextResponse.json({ error: 'entityType e entityId são obrigatórios' }, { status: 400 })
  }
  return NextResponse.json(await getComments(entityType, entityId))
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const comment: Comment = {
    id: crypto.randomUUID(),
    entityType: body.entityType,
    entityId: body.entityId,
    author: session.name,
    text: body.text,
    createdAt: new Date().toLocaleString('pt-BR'),
  }

  await addComment(comment)
  await addActivity(session.name, 'comentou em', `${body.entityType}`)
  return NextResponse.json(comment, { status: 201 })
}
