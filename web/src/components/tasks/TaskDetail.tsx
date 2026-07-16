'use client'

import { useState } from 'react'
import { X, Send, Paperclip, Calendar, User, MessageSquare } from 'lucide-react'
import type { Task } from '@/lib/types'
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from '@/lib/types'

type TaskDetailProps = {
  task: Task
  onClose: () => void
  onUpdated: () => void
}

export function TaskDetail({ task, onClose, onUpdated }: TaskDetailProps) {
  const [comment, setComment] = useState('')

  async function handleAddComment() {
    if (!comment.trim()) return
    const newComment = {
      id: crypto.randomUUID(),
      author: 'Usuário',
      text: comment.trim(),
      createdAt: new Date().toLocaleString('pt-BR'),
    }
    await fetch('/api/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: task.id,
        comments: [...task.comments, newComment],
      }),
    })
    setComment('')
    onUpdated()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 pt-12">
      <div className="mx-4 mb-12 w-full max-w-xl rounded-xl border border-zinc-200 bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <h3 className="text-base font-semibold text-zinc-900">{task.title}</h3>
          <button onClick={onClose} className="rounded p-1 text-zinc-400 hover:bg-zinc-100">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {task.description && (
            <div>
              <p className="text-xs font-medium text-zinc-500 mb-1">Descrição</p>
              <p className="text-sm text-zinc-700">{task.description}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-3 text-xs text-zinc-600">
            <span className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5">
              <User size={14} /> {task.responsible || 'Sem responsável'}
            </span>
            <span className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5">
              <Calendar size={14} /> {task.deadline || 'Sem prazo'}
            </span>
            <span className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5">
              Status: {TASK_STATUS_LABELS[task.status]}
            </span>
            <span className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${
              task.priority === 'alta' ? 'bg-red-50 text-red-600' :
              task.priority === 'media' ? 'bg-amber-50 text-amber-600' :
              'bg-green-50 text-green-600'
            }`}>
              {TASK_PRIORITY_LABELS[task.priority]}
            </span>
          </div>

          {task.attachments.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                <Paperclip size={14} /> Anexos
              </p>
              <div className="space-y-1">
                {task.attachments.map(a => (
                  <a key={a.id} href={a.url} className="block text-sm text-indigo-600 hover:underline">{a.name}</a>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-zinc-500">
              <MessageSquare size={14} /> Comentários
            </p>
            <div className="mb-3 max-h-48 space-y-2 overflow-y-auto">
              {task.comments.length === 0 && (
                <p className="text-xs text-zinc-400">Nenhum comentário ainda.</p>
              )}
              {task.comments.map(c => (
                <div key={c.id} className="rounded-lg bg-zinc-50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-700">{c.author}</span>
                    <span className="text-[10px] text-zinc-400">{c.createdAt}</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-600">{c.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text" placeholder="Adicionar comentário..."
                value={comment} onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              <button
                onClick={handleAddComment}
                className="rounded-lg bg-zinc-900 px-3 py-2 text-white transition-all hover:bg-zinc-800"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
