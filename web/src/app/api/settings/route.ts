import { NextResponse } from 'next/server'
import { getUserSettings, upsertUserSettings } from '@/lib/store'
import { getSession } from '@/lib/session'
import type { UserSettings } from '@/lib/types'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  let settings = await getUserSettings(session.id)
  if (!settings) {
    settings = {
      userId: session.id,
      theme: 'indigo',
      mode: 'light',
      notifyTaskAssigned: true,
      notifyDeadline: true,
      notifyChecklist: true,
    }
    await upsertUserSettings(settings)
  }

  return NextResponse.json({ settings })
}

export async function PUT(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const settings = {
    userId: session.id,
    theme: body.theme ?? 'indigo',
    mode: body.mode ?? 'light',
    notifyTaskAssigned: body.notifyTaskAssigned ?? true,
    notifyDeadline: body.notifyDeadline ?? true,
    notifyChecklist: body.notifyChecklist ?? true,
  }

  await upsertUserSettings(settings)
  return NextResponse.json({ settings })
}
