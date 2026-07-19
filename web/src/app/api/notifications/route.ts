import { NextResponse } from 'next/server'
import { getNotifications, getUnreadNotificationCount, markNotificationRead, markAllNotificationsRead } from '@/lib/store'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const [notifications, unreadCount] = await Promise.all([
    getNotifications(session.id),
    getUnreadNotificationCount(session.id),
  ])

  return NextResponse.json({ notifications, unreadCount })
}

export async function PUT(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { id, all } = await request.json()

  if (all) {
    await markAllNotificationsRead(session.id)
  } else if (id) {
    await markNotificationRead(id)
  }

  return NextResponse.json({ success: true })
}
