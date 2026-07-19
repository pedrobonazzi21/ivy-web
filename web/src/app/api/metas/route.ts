import { NextResponse } from 'next/server'
import { getGoals, addGoal, updateGoal, updateGoalItem, deleteGoal, addActivity } from '@/lib/store'
import { getSession } from '@/lib/session'
import type { Goal } from '@/lib/types'

export async function GET() {
  return NextResponse.json(await getGoals())
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const goal: Goal = {
    id: crypto.randomUUID(),
    title: body.title,
    description: body.description ?? '',
    status: body.status ?? 'nao_iniciada',
    deadline: body.deadline ?? '',
    progress: 0,
    createdAt: new Date().toLocaleString('pt-BR'),
    createdBy: session.name,
    items: (body.items ?? []).map((label: string) => ({
      id: crypto.randomUUID(),
      goalId: '',
      label,
      taskId: '',
      done: false,
    })),
  }
  goal.items.forEach(i => i.goalId = goal.id)

  await addGoal(goal)
  await addActivity(session.name, 'criou meta', goal.title)
  return NextResponse.json(goal, { status: 201 })
}

export async function PUT(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await request.json()

  if (body.itemId !== undefined) {
    const { itemId, done } = body
    await updateGoalItem(itemId, done)
    return NextResponse.json({ success: true })
  }

  const { id, title, description, status, deadline, items } = body
  const updated = await updateGoal(id, { title, description, status, deadline, items })
  if (!updated) {
    return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })
  }
  await addActivity(session.name, 'editou meta', updated.title)
  return NextResponse.json(updated)
}

export async function DELETE(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { id } = await request.json()
  await deleteGoal(id)
  return NextResponse.json({ success: true })
}
