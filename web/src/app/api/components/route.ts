import { NextResponse } from 'next/server'
import { getComponents, addComponent, updateComponent, deleteComponent, addActivity } from '@/lib/store'
import { getSession } from '@/lib/session'
import type { Component } from '@/lib/types'

export async function GET() {
  return NextResponse.json(await getComponents())
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const comp: Component = {
    id: crypto.randomUUID(),
    name: body.name,
    quantity: body.quantity ?? 0,
    available: body.available ?? body.quantity ?? 0,
    inUse: body.inUse ?? 0,
    supplier: body.supplier ?? '',
    price: body.price ?? 0,
    status: body.status ?? 'em_estoque',
    location: body.location ?? '',
    datasheetUrl: body.datasheetUrl ?? '',
    createdAt: new Date().toLocaleString('pt-BR'),
    createdBy: session.name,
  }

  await addComponent(comp)
  await addActivity(session.name, 'adicionou componente', comp.name)
  return NextResponse.json(comp, { status: 201 })
}

export async function PUT(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const updated = await updateComponent(body.id, body)
  if (!updated) {
    return NextResponse.json({ error: 'Componente não encontrado' }, { status: 404 })
  }
  await addActivity(session.name, 'atualizou componente', updated.name)
  return NextResponse.json(updated)
}

export async function DELETE(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { id } = await request.json()
  const comps = await getComponents()
  const comp = comps.find(c => c.id === id)
  if (!comp) {
    return NextResponse.json({ error: 'Componente não encontrado' }, { status: 404 })
  }

  await deleteComponent(id)
  await addActivity(session.name, 'removeu componente', comp.name)
  return NextResponse.json({ success: true })
}
