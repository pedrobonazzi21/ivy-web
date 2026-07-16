import { NextResponse } from 'next/server'
import { addTeamMember, addActivity } from '@/lib/store'
import { getSession } from '@/lib/session'
import type { TeamMember } from '@/lib/types'

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
