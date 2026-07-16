import { cookies } from 'next/headers'

const SESSION_COOKIE = 'ivy_session'

export type SessionUser = {
  id: string
  name: string
  email: string
  role: 'admin' | 'colaborador' | 'visitante'
  teamCode?: string
  microsoftAccessToken?: string
  microsoftRefreshToken?: string
  onedriveConnected?: boolean
}

function encode(user: SessionUser): string {
  return Buffer.from(JSON.stringify(user)).toString('base64')
}

function decode(value: string): SessionUser | null {
  try {
    return JSON.parse(Buffer.from(value, 'base64').toString('utf-8'))
  } catch {
    return null
  }
}

export async function createSession(user: SessionUser): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, encode(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const value = cookieStore.get(SESSION_COOKIE)?.value
  if (!value) return null
  return decode(value)
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function updateSession(partial: Partial<SessionUser>): Promise<void> {
  const user = await getSession()
  if (!user) return
  await createSession({ ...user, ...partial })
}

export function getSessionFromCookie(cookieValue: string | undefined): SessionUser | null {
  if (!cookieValue) return null
  return decode(cookieValue)
}
