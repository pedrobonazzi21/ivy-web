import { NextResponse } from 'next/server'
import { getFileVersions, addFileVersion, addActivity } from '@/lib/store'
import { getSession } from '@/lib/session'
import type { FileVersion } from '@/lib/types'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get('fileId') ?? undefined
  return NextResponse.json(await getFileVersions(fileId))
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const existing = await getFileVersions(body.fileId)
  const nextVersion = existing.length > 0 ? Math.max(...existing.map(v => v.version)) + 1 : 1

  const version: FileVersion = {
    id: crypto.randomUUID(),
    fileId: body.fileId,
    fileName: body.fileName,
    version: nextVersion,
    editedBy: session.name,
    editedAt: new Date().toLocaleString('pt-BR'),
    description: body.description ?? '',
  }

  await addFileVersion(version)
  await addActivity(session.name, 'criou versão', `${version.fileName} (v${version.version})`)
  return NextResponse.json(version, { status: 201 })
}
