import { NextResponse } from 'next/server'
import { getSession, updateSession } from '@/lib/session'
import { addActivity } from '@/lib/store'

export async function POST() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  if (session.onedriveConnected) {
    return NextResponse.json({ connected: true, message: 'OneDrive já está conectado' })
  }

  await updateSession({
    microsoftAccessToken: 'mock_access_token_' + crypto.randomUUID(),
    microsoftRefreshToken: 'mock_refresh_token_' + crypto.randomUUID(),
    onedriveConnected: true,
  })

  await addActivity(session.name, 'conectou', 'OneDrive ao projeto')
  return NextResponse.json({ connected: true })
}

export async function DELETE() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  await updateSession({
    microsoftAccessToken: undefined,
    microsoftRefreshToken: undefined,
    onedriveConnected: false,
  })

  await addActivity(session.name, 'desconectou', 'OneDrive do projeto')
  return NextResponse.json({ connected: false })
}
