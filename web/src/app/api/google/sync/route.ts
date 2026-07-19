import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getValidToken } from '@/lib/google'

export async function POST() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { default: prisma } = await import('@/lib/prisma')
  const links = await prisma.googleDriveLink.findMany()
  const results: { id: string; fileName: string; synced: boolean }[] = []

  for (const link of links) {
    try {
      const { syncLinkedDoc } = await import('@/lib/google')
      await syncLinkedDoc(link)
      results.push({ id: link.id, fileName: link.fileName, synced: true })
    } catch {
      results.push({ id: link.id, fileName: link.fileName, synced: false })
    }
  }

  return NextResponse.json({ results })
}
