import { NextResponse } from 'next/server'
import { getValidToken, listDriveFiles } from '@/lib/google'
import { getSession } from '@/lib/session'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const token = await getValidToken()
  if (!token) {
    return NextResponse.json({ files: [], connected: false })
  }

  const url = new URL(request.url)
  const query = url.searchParams.get('q')

  const files = await listDriveFiles(query ?? undefined)
  return NextResponse.json({ files, connected: true })
}
