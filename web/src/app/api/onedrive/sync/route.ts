import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function POST() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  if (!(session as any).onedriveConnected) {
    return NextResponse.json({ error: 'OneDrive não conectado' }, { status: 400 })
  }

  return NextResponse.json({ success: true, message: 'OneDrive conectado', folders: [] })
}
