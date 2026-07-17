import { NextResponse } from 'next/server'
import { createSession } from '@/lib/session'
import { auth } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()
    if (!token) return NextResponse.json({ error: 'Token não fornecido' }, { status: 400 })

    const decoded = await auth.verifyIdToken(token)

    await createSession({
      id: decoded.uid,
      name: decoded.name || decoded.email || 'Usuário',
      email: decoded.email || '',
      role: 'admin',
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
  }
}
