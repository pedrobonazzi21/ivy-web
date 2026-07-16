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
      <svg viewBox="0 0 21 21" width="18" height="18" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="9" height="9" fill="#f25022" />
        <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
        <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
        <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
      </svg>
      Entrar com Microsoft
    </button>
  )
}
