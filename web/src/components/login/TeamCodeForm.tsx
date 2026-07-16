'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'

type TeamCodeFormProps = {
  onSuccess: () => void
}

export function TeamCodeForm({ onSuccess }: TeamCodeFormProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      setError('Digite o código da equipe')
      return
    }
    setError('')
    onSuccess()
  }

  return (
    <div className="space-y-4">
      <div className="border-t border-zinc-200 pt-6">
        <p className="mb-1 text-sm font-medium text-zinc-700">Primeiro acesso?</p>
        <p className="mb-4 text-xs text-zinc-500">
          Digite o código da equipe. O código somente será solicitado no primeiro acesso.
          Depois disso a conta Microsoft ficará vinculada ao projeto.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            placeholder="Código da equipe"
            value={code}
            onChange={(e) => { setCode(e.target.value); setError('') }}
            className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 active:scale-[0.98]"
        >
          Entrar
          <ArrowRight size={16} />
        </button>
      </form>
    </div>
  )
}
