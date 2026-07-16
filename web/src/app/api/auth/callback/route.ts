import { NextResponse } from 'next/server'
import { createSession } from '@/lib/session'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL('/?error=auth_denied', request.url))
  }

  if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
    if (!code) {
      return NextResponse.redirect(new URL('/?error=no_code', request.url))
    }
    // Real OAuth: would exchange code for access token here
    // const token = await exchangeCodeForToken(code)
  }

  // Mock/dev mode: create session with simulated Microsoft user + OneDrive tokens
  await createSession({
    id: crypto.randomUUID(),
    name: 'Usuário Microsoft',
    email: 'usuario@ivyprojeto.com',
    role: 'admin',
    microsoftAccessToken: 'mock_access_token_' + crypto.randomUUID(),
    microsoftRefreshToken: 'mock_refresh_token_' + crypto.randomUUID(),
    onedriveConnected: true,
  })

  return NextResponse.redirect(new URL('/dashboard', request.url))
}
