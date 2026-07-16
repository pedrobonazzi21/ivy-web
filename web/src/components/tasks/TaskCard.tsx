'use client'

import { Calendar, User, MessageSquare, Paperclip, Trash2, GripVertical } from 'lucide-react'
import type { Task, TaskStatus } from '@/lib/types'
import { TASK_PRIORITY_LABELS } from '@/lib/types'

type TaskCardProps = {
  task: Task
  onStatusChange: (id: string, status: TaskStatus) => void
  onDelete: (id: string) => void
}

const PRIORITY_COLORS: Record<string, string> = {
  alta: 'border-l-red-500',
  media: 'border-l-amber-500',
  baixa: 'border-l-green-500',
}

export function TaskCard({ task, onStatusChange, onDelete }: TaskCardProps) {
  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData('taskId', task.id)
    e.currentTarget.classList.add('opacity-50')
  }

  function handleDragEnd(e: React.DragEvent) {
    e.currentTarget.classList.remove('opacity-50')
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`group cursor-grab rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:shadow-md active:cursor-grabbing border-l-4 ${PRIORITY_COLORS[task.priority] || 'border-l-zinc-300'}`}
    >
      <div className="mb-2 flex items-start justify-between">
        <h4 className="text-sm font-semibold text-zinc-900">{task.title}</h4>
        <button
          onClick={() => onDelete(task.id)}
          className="shrink-0 rounded p-1 text-zinc-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {task.description && (
        <p className="mb-3 text-xs text-zinc-500 line-clamp-2">{task.description}</p>
      )}

      <div className="mb-3 flex flex-wrap gap-1.5">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
          task.priority === 'alta' ? 'bg-red-50 text-red-600' :
          task.priority === 'media' ? 'bg-amber-50 text-amber-600' :
          'bg-green-50 text-green-600'
        }`}>
          {TASK_PRIORITY_LABELS[task.priority]}
        </span>
      </div>

      <div className="flex items-center gap-3 text-[11px] text-zinc-400">
        {task.responsible && (
          <span className="flex items-center gap-1">
            <User size={12} />
            {task.responsible}
          </span>
        )}
        {task.deadline && (
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {task.deadline}
          </span>
        )}
        {task.comments.length > 0 && (
          <span className="flex items-center gap-1">
            <MessageSquare size={12} />
            {task.comments.length}
          </span>
        )}
        {task.attachments.length > 0 && (
          <span className="flex items-center gap-1">
            <Paperclip size={12} />
            {task.attachments.length}
          </span>
        )}
      </div>
    </div>
  )
}
