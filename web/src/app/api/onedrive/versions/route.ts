import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getOneDriveItem, getOneDriveVersions } from '@/lib/onedrive/store'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get('fileId')

  if (!fileId) {
    return NextResponse.json({ error: 'fileId é obrigatório' }, { status: 400 })
  }

  const item = getOneDriveItem(fileId)
  if (!item) {
    return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 })
  }

  const versions = getOneDriveVersions(fileId)
  return NextResponse.json({ file: item, versions })
}
