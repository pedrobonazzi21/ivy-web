import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST() {
  try {
    await prisma.activity.deleteMany()
    await prisma.fileVersion.deleteMany()
    await prisma.fileEntry.deleteMany()
    await prisma.task.deleteMany()
    await prisma.component.deleteMany()
    await prisma.teamMember.deleteMany()
    await prisma.diaryEntry.deleteMany()
    await prisma.testRecord.deleteMany()
    await prisma.comment.deleteMany()
    await prisma.calendarEvent.deleteMany()
    await prisma.stats.deleteMany()

    await prisma.stats.create({
      data: { id: 'singleton', progress: 0, totalTests: 0, lastUpdate: new Date().toLocaleString('pt-BR') },
    })

    return NextResponse.json({ success: true, message: 'Banco limpo com sucesso!' })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
