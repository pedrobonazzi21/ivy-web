import { NextResponse } from 'next/server'
import { getTestRecords, addTestRecord, updateTestRecord, deleteTestRecord, addActivity } from '@/lib/store'
import { getSession } from '@/lib/session'
import type { TestRecord } from '@/lib/types'

export async function GET() {
  return NextResponse.json(await getTestRecords())
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const record: TestRecord = {
    id: crypto.randomUUID(),
    name: body.name,
    result: body.result ?? 0,
    problem: body.problem ?? '',
    solution: body.solution ?? '',
    attachments: body.attachments ?? [],
    createdBy: session.name,
    createdAt: new Date().toLocaleString('pt-BR'),
  }

  await addTestRecord(record)
  await addActivity(session.name, 'registrou teste', record.name)
  return NextResponse.json(record, { status: 201 })
}

export async function PUT(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const updated = await updateTestRecord(body.id, body)
  if (!updated) {
    return NextResponse.json({ error: 'Teste não encontrado' }, { status: 404 })
  }
  await addActivity(session.name, 'atualizou teste', updated.name)
  return NextResponse.json(updated)
}

export async function DELETE(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { id } = await request.json()
  const tests = await getTestRecords()
  const test = tests.find(t => t.id === id)
  if (!test) {
    return NextResponse.json({ error: 'Teste não encontrado' }, { status: 404 })
  }

  await deleteTestRecord(id)
  await addActivity(session.name, 'removeu teste', test.name)
  return NextResponse.json({ success: true })
}
