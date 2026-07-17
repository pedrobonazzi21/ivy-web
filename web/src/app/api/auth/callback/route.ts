import { NextResponse } from 'next/server'
import { createSession } from '@/lib/session'

const FIREBASE_API_KEY = 'AIzaSyD_zyX7Zanc0scjxdlaDk-xkJSt3pv4naQ'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()
    if (!token) return NextResponse.json({ error: 'Token não fornecido' }, { status: 400 })

    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token }),
      },
    )

    const data = await res.json()

    if (!res.ok || !data.users?.[0]) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const user = data.users[0]

    await createSession({
      id: user.localId,
      name: user.displayName || user.email || 'Usuário',
      email: user.email || '',
      role: 'admin',
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao verificar token' }, { status: 500 })
  }
}
