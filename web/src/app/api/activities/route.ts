import { NextResponse } from 'next/server'
import { getActivities, addActivity } from '@/lib/store'
import { getSession } from '@/lib/session'

export async function GET() {
  return NextResponse.json(await getActivities())
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { action, target } = await request.json()
  const activity = await addActivity(session.name, action, target)
  return NextResponse.json(activity, { status: 201 })
}
