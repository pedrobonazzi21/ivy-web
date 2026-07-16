import { NextResponse } from 'next/server'
import { getFiles, addFile, deleteFile, addFileVersion } from '@/lib/store'
import { getSession } from '@/lib/session'
import type { FileEntry } from '@/lib/store'

export async function GET() {
  return NextResponse.json(await getFiles())
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const file: FileEntry = {
    id: crypto.randomUUID(),
    name: body.name,
    category: body.category,
    size: body.size ?? 0,
    uploadedBy: session.name,
    uploadedAt: new Date().toLocaleString('pt-BR'),
    url: body.url ?? '',
  }

  await addFile(file)
  await addFileVersion({
    id: crypto.randomUUID(),
    fileId: file.id,
    fileName: file.name,
    version: 1,
    editedBy: session.name,
    editedAt: file.uploadedAt,
    description: 'Versão inicial',
  })
  return NextResponse.json(file, { status: 201 })
}

export async function DELETE(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { id } = await request.json()
  await deleteFile(id)
  return NextResponse.json({ success: true })
}
