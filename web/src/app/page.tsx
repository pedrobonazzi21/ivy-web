'use client'

import { useState, useEffect } from 'react'
import { MicrosoftLoginButton } from '@/components/login/MicrosoftLoginButton'
import { RoleInfo } from '@/components/login/RoleInfo'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const err = params.get('error')
    if (err === 'auth_denied') setError('Acesso negado. Tente novamente.')
    else if (err === 'no_code') setError('Erro na autenticação.')
  }, [])

  async function handleTeamCode(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) {
      setError('Digite o código da equipe')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/team/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      })
      const data = await res.json()
      if (!data.valid) {
        setError(data.error || 'Código inválido')
        return
      }
      router.push('/dashboard')
    } catch {
      setError('Erro ao validar código. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-center border-b border-zinc-200 bg-white px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 text-sm font-bold text-white">
            I
          </div>
          <span className="text-xl font-bold text-zinc-900">IVY</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">EngiHub</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Projeto: Robô Educacional FEBRACE
          </p>
        </div>

        <div className="mb-8 space-y-6 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleTeamCode}>
            <div>
              <p className="mb-1 text-sm font-medium text-zinc-700">Acessar Projeto</p>
              <p className="mb-4 text-xs text-zinc-500">
                Digite o código da equipe para acessar o projeto.
              </p>
            </div>
            <div className="mt-3 flex gap-2">
              <input
                name="code"
                type="text"
                placeholder="Código da equipe"
                value={code}
                onChange={(e) => { setCode(e.target.value); setError('') }}
                className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 disabled:opacity-50"
              >
                {loading ? '...' : 'Entrar'}
              </button>
            </div>
            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
          </form>
        </div>

        <RoleInfo />
      </main>
    </div>
  )
}
