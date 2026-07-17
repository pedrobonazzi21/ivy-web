'use client'

import { LogIn } from 'lucide-react'

export function MicrosoftLoginButton() {
  const handleLogin = () => {
    window.location.href = '/api/auth'
  }

  return (
    <button
      onClick={handleLogin}
      className="flex w-full items-center justify-center gap-3 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.98]"
    >
      <LogIn size={18} />
      Entrar
    </button>
  )
}
