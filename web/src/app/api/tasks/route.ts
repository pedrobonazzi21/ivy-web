import { NextResponse } from 'next/server'
import { getTasks, addTask, updateTask, deleteTask, addActivity } from '@/lib/store'
import { getSession } from '@/lib/session'
import type { Task } from '@/lib/types'

export async function GET() {
  return NextResponse.json(await getTasks())
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const task: Task = {
    id: crypto.randomUUID(),
    title: body.title,
    description: body.description ?? '',
    status: body.status ?? 'a_fazer',
    priority: body.priority ?? 'media',
    responsible: body.responsible ?? '',
    deadline: body.deadline ?? '',
    comments: [],
    attachments: [],
    createdAt: new Date().toLocaleString('pt-BR'),
    createdBy: session.name,
  }

  await addTask(task)
  await addActivity(session.name, 'criou tarefa', task.title)
  return NextResponse.json(task, { status: 201 })
}

export async function PUT(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const updated = await updateTask(body.id, body)
  if (!updated) {
    return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })
  }
  if (body.status) {
    const statusLabels: Record<string, string> = {
      a_fazer: 'A Fazer', em_andamento: 'Em Andamento', em_revisao: 'Em Revisão', concluido: 'Concluído',
    }
    await addActivity(session.name, 'moveu tarefa para', statusLabels[body.status])
  }
  return NextResponse.json(updated)
}

export async function DELETE(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { id } = await request.json()
  const tasks = await getTasks()
  const task = tasks.find(t => t.id === id)
  if (!task) {
    return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })
  }

  await deleteTask(id)
  await addActivity(session.name, 'removeu tarefa', task.title)
  return NextResponse.json({ success: true })
}
