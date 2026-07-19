import { NextResponse, NextRequest } from 'next/server'
import { handleCallback } from '@/lib/google'
import { getSession, updateSession } from '@/lib/session'
import { addActivity } from '@/lib/store'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.redirect(new URL('/?error=unauthorized', request.url))
  }

  const code = request.nextUrl.searchParams.get('code')
  const error = request.nextUrl.searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(new URL('/projeto/google?error=auth_failed', request.url))
  }

  try {
    await handleCallback(code)
    await updateSession({ googleConnected: true })
    await addActivity(session.name, 'conectou', 'Google Drive ao projeto')
    return NextResponse.redirect(new URL('/projeto/google?success=connected', request.url))
  } catch {
    return NextResponse.redirect(new URL('/projeto/google?error=token_failed', request.url))
  }
}
