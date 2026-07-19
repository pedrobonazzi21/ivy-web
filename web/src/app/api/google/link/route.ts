import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { addActivity } from '@/lib/store'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const links = await prisma.googleDriveLink.findMany({ orderBy: { linkedAt: 'desc' } })
  return NextResponse.json({ links })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { fileId, fileName, mimeType, webUrl } = await request.json()

  const existing = await prisma.googleDriveLink.findUnique({ where: { fileId } })
  if (existing) {
    return NextResponse.json({ error: 'Arquivo já vinculado' }, { status: 409 })
  }

  const now = new Date().toLocaleString('pt-BR')
  const link = await prisma.googleDriveLink.create({
    data: {
      fileId,
      fileName,
      mimeType,
      webUrl: webUrl || '',
      linkedBy: session.name,
      linkedAt: now,
      lastSyncedAt: now,
      lastModifiedAt: now,
      content: '',
    },
  })

  await addActivity(session.name, 'vinculou arquivo do Google Drive', fileName)
  return NextResponse.json(link, { status: 201 })
}

export async function DELETE(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { id } = await request.json()
  const link = await prisma.googleDriveLink.findUnique({ where: { id } })
  if (!link) {
    return NextResponse.json({ error: 'Link não encontrado' }, { status: 404 })
  }

  await prisma.googleDriveLink.delete({ where: { id } })
  await addActivity(session.name, 'removeu vínculo do Google Drive', link.fileName)

  return NextResponse.json({ success: true })
}
