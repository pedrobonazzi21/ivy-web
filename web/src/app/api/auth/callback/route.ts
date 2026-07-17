import { NextResponse } from 'next/server'
import { createSession } from '@/lib/session'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL('/?error=auth_denied', request.url))
  }

  await createSession({
    id: crypto.randomUUID(),
    name: 'Usuário',
    email: 'usuario@ivyprojeto.com',
    role: 'admin',
  })

  return NextResponse.redirect(new URL('/dashboard', request.url))
}
