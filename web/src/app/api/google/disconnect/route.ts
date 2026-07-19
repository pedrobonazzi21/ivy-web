import { NextResponse } from 'next/server'
import { disconnectGoogle } from '@/lib/google'
import { getSession, updateSession } from '@/lib/session'
import { addActivity } from '@/lib/store'

export async function POST() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  await disconnectGoogle()
  await updateSession({ googleConnected: false })
  await addActivity(session.name, 'desconectou', 'Google Drive do projeto')

  return NextResponse.json({ connected: false })
}
