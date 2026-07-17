'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth, signInWithGoogle, signInWithEmail, signUpWithEmail } from '@/lib/firebase'

export default function LoginPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [secretCode, setSecretCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleGoogle() {
    setLoading(true)
    setError('')
    try {
      const result = await signInWithGoogle()
      const token = await result.user.getIdToken()
      const res = await fetch('/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      if (res.ok) router.push('/dashboard')
      else setError('Erro ao criar sessão')
    } catch (e: any) {
      setError(e.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Preencha email e senha')
      return
    }
    if (password.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres')
      return
    }
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        if (secretCode !== 'socorro-ivy') {
          setError('Código secreto inválido')
          setLoading(false)
          return
        }
        await signUpWithEmail(email, password)
      }

      await signInWithEmail(email, password)
      const user = auth.currentUser
      if (!user) throw new Error('Usuário não autenticado')
      const token = await user.getIdToken()
      const res = await fetch('/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      if (res.ok) router.push('/dashboard')
      else setError('Erro ao criar sessão')
    } catch (e: any) {
      setError(e.message || 'Erro na autenticação')
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

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">EngiHub</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Projeto: Robô Educacional FEBRACE
          </p>
        </div>

        <div className="space-y-6 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Entrar com Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200"/>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-zinc-400">ou</span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="mínimo 6 caracteres"
              />
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Código Secreto</label>
                <input
                  type="text"
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="socorro-ivy"
                />
              </div>
            )}

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800 disabled:opacity-50"
            >
              {loading ? '...' : isSignUp ? 'Criar conta' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-500">
            {isSignUp ? 'Já tem conta?' : 'Não tem conta?'}{' '}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError('') }}
              className="font-medium text-indigo-600 hover:text-indigo-700"
            >
              {isSignUp ? 'Fazer login' : 'Cadastre-se'}
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}
