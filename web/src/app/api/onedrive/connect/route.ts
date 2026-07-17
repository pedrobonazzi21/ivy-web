import { NextResponse } from 'next/server'
import { getSession, updateSession } from '@/lib/session'
import { addActivity } from '@/lib/store'

export async function POST() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  if ((session as any).onedriveConnected) {
    return NextResponse.json({ connected: true, message: 'OneDrive já está conectado' })
  }

  await updateSession({
    onedriveConnected: true as any,
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
    onedriveConnected: false as any,
  })

  await addActivity(session.name, 'desconectou', 'OneDrive do projeto')
  return NextResponse.json({ connected: false })
}
