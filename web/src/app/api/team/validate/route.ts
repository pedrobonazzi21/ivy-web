import { NextResponse } from 'next/server'
import { getSession, updateSession } from '@/lib/session'
import { validateTeamCode } from '@/lib/store'

export async function POST(request: Request) {
  const { code } = await request.json()

  if (!code?.trim()) {
    return NextResponse.json({ valid: false, error: 'Código obrigatório' }, { status: 400 })
  }

  const session = await getSession()
  if (!session) {
    return NextResponse.json({ valid: false, error: 'Não autenticado' }, { status: 401 })
  }

  const team = await validateTeamCode(code.trim())
  if (!team) {
    return NextResponse.json({ valid: false, error: 'Código inválido ou já utilizado' }, { status: 400 })
  }

  await updateSession({ teamCode: team.code })

  return NextResponse.json({ valid: true, projectName: team.projectName })
}
