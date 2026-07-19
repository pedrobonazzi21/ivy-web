'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { isPageBlocked } from '@/lib/roles'
import { Eye, Loader } from 'lucide-react'

export function PageGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'allowed' | 'blocked'>('loading')

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (!d.authenticated) {
          router.push('/')
          return
        }
        if (isPageBlocked(d.user.role, pathname)) {
          setStatus('blocked')
        } else {
          setStatus('allowed')
        }
      })
  }, [pathname, router])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-400">
        <Loader size={20} className="mr-2 animate-spin" /> Carregando...
      </div>
    )
  }

  if (status === 'blocked') {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <Eye size={48} className="mx-auto mb-4 text-zinc-300" />
        <h2 className="text-lg font-semibold text-zinc-900">Acesso Restrito</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Você não tem permissão para acessar esta página.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
