'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import type { Comment } from '@/lib/types'

type CommentSectionProps = {
  entityType: string
  entityId: string
}

export function CommentSection({ entityType, entityId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadComments() {
    setLoading(true)
    const res = await fetch(`/api/comments?entityType=${entityType}&entityId=${entityId}`)
    const data = await res.json()
    setComments(data)
    setLoading(false)
  }

  useEffect(() => { loadComments() }, [entityType, entityId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return

    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entityType, entityId, text: text.trim() }),
    })

    if (res.ok) {
      setText('')
      loadComments()
    }
  }

  return (
    <div>
      <h4 className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
        <MessageSquare size={14} />
        Comentários
      </h4>

      <div className="mb-3 max-h-48 space-y-2 overflow-y-auto">
        {loading ? (
          <p className="text-xs text-zinc-400">Carregando...</p>
        ) : comments.length === 0 ? (
          <p className="text-xs text-zinc-400">Nenhum comentário ainda.</p>
        ) : (
          comments.map(c => (
            <div key={c.id} className="rounded-lg bg-zinc-50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-700">{c.author}</span>
                <span className="text-[10px] text-zinc-400">{c.createdAt}</span>
              </div>
              <p className="mt-1 text-xs text-zinc-600">{c.text}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input type="text" placeholder="Adicionar comentário..."
          value={text} onChange={(e) => setText(e.target.value)}
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
        <button type="submit"
          className="rounded-lg bg-zinc-900 px-3 py-2 text-white transition-all hover:bg-zinc-800">
          <Send size={14} />
        </button>
      </form>
    </div>
  )
}
