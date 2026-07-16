'use client'

import { useState, useEffect } from 'react'
import { Plus, Loader } from 'lucide-react'
import { TaskCard } from './TaskCard'
import { TaskForm } from './TaskForm'
import type { Task, TaskStatus } from '@/lib/types'
import { TASK_STATUS_LABELS } from '@/lib/types'

const COLUMNS: TaskStatus[] = ['a_fazer', 'em_andamento', 'em_revisao', 'concluido']

const COLUMN_COLORS: Record<TaskStatus, string> = {
  a_fazer: 'border-t-zinc-400',
  em_andamento: 'border-t-sky-500',
  em_revisao: 'border-t-amber-500',
  concluido: 'border-t-green-500',
}

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  async function loadTasks() {
    setLoading(true)
    const res = await fetch('/api/tasks')
    const data = await res.json()
    setTasks(data)
    setLoading(false)
  }

  useEffect(() => { loadTasks() }, [])

  async function handleStatusChange(id: string, newStatus: TaskStatus) {
    await fetch('/api/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    })
    loadTasks()
  }

  async function handleDelete(id: string) {
    await fetch('/api/tasks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    loadTasks()
  }

  function handleDrop(e: React.DragEvent, status: TaskStatus) {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    if (taskId) handleStatusChange(taskId, status)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  function getColumnTasks(status: TaskStatus) {
    return tasks.filter(t => t.status === status)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-zinc-400">
        <Loader size={20} className="mr-2 animate-spin" />
        Carregando...
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Quadro Kanban</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-zinc-800"
        >
          <Plus size={16} />
          Nova Tarefa
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <TaskForm
            onCreated={() => { loadTasks(); setShowForm(false) }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map(status => (
          <div
            key={status}
            onDrop={(e) => handleDrop(e, status)}
            onDragOver={handleDragOver}
            className={`rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 shadow-sm border-t-4 ${COLUMN_COLORS[status]}`}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-700">
                {TASK_STATUS_LABELS[status]}
              </h3>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-[11px] font-medium text-zinc-600">
                {getColumnTasks(status).length}
              </span>
            </div>

            <div className="space-y-3 min-h-[120px]">
              {getColumnTasks(status).map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              ))}
              {getColumnTasks(status).length === 0 && (
                <p className="py-6 text-center text-xs text-zinc-400">
                  Arraste tarefas para cá
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
