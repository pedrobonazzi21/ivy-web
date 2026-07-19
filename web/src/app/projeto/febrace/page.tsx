'use client'

import { useState, useEffect } from 'react'
import { FebraceDashboard } from '@/components/febrace/FebraceDashboard'
import { useRouter } from 'next/navigation'

export default function FebracePage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(d => {
        if (!d.authenticated) router.push('/')
        else setUser(d.user)
      })
  }, [router])

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-500">
        Carregando...
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <FebraceDashboard />
    </div>
  )
}
