import { NextResponse } from 'next/server'
import { getTeamMembers, addTeamMember, updateTeamMember, removeTeamMember, addActivity } from '@/lib/store'
import { getSession } from '@/lib/session'
import type { TeamMember } from '@/lib/types'

export async function GET() {
  return NextResponse.json(await getTeamMembers())
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const member: TeamMember = {
    id: crypto.randomUUID(),
    name: body.name,
    email: body.email,
    role: body.role ?? 'colaborador',
    invitedAt: new Date().toLocaleString('pt-BR'),
  }

  await addTeamMember(member)
  await addActivity(session.name, 'convidou', member.name)
  return NextResponse.json(member, { status: 201 })
}

export async function PUT(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const updated = await updateTeamMember(body.id, body)
  if (!updated) {
    return NextResponse.json({ error: 'Membro não encontrado' }, { status: 404 })
  }
  await addActivity(session.name, 'alterou permissão de', updated.name)
  return NextResponse.json(updated)
}

export async function DELETE(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { id } = await request.json()
  const members = await getTeamMembers()
  const member = members.find(m => m.id === id)
  if (!member) {
    return NextResponse.json({ error: 'Membro não encontrado' }, { status: 404 })
  }

  await removeTeamMember(id)
  await addActivity(session.name, 'removeu', member.name)
  return NextResponse.json({ success: true })
}
