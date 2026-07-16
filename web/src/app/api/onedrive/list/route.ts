import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getOneDriveItems } from '@/lib/onedrive/store'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const folderPath = searchParams.get('path') || '/'

  if (!session.onedriveConnected) {
    return NextResponse.json({ connected: false, items: [] })
  }

  const items = getOneDriveItems(folderPath)
  return NextResponse.json({ connected: true, path: folderPath, items })
}
