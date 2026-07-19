'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, Loader, Camera, Key } from 'lucide-react'
import { auth, uploadFile } from '@/lib/firebase'
import { sendPasswordResetEmail } from 'firebase/auth'
import type { UserSettings } from '@/lib/types'
import { ROLE_LABELS } from '@/lib/types'

export default function ConfiguracoesPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/settings').then(r => r.json()),
    ]).then(([auth, data]) => {
      if (!auth.authenticated) { router.push('/'); return }
      setUser(auth.user)
      setSettings(data.settings)
      setPhotoUrl(auth.user.photoURL ?? null)
      setLoading(false)
    })
  }, [router])

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadFile(file, `avatars/${user?.email}_${Date.now()}`)
      setPhotoUrl(url)
    } catch {
      console.error('Erro ao enviar foto')
    }
    setUploading(false)
  }

  async function handlePasswordReset() {
    if (!user?.email) return
    try {
      await sendPasswordResetEmail(auth, user.email)
      setPasswordMsg('Email de redefinição enviado! Verifique sua caixa de entrada.')
    } catch {
      setPasswordMsg('Erro ao enviar email. Tente novamente.')
    }
  }

  async function handleToggle(key: 'notifyTaskAssigned' | 'notifyDeadline' | 'notifyChecklist') {
    if (!settings) return
    setSaving(true)
    const updated = { ...settings, [key]: !settings[key] }
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    const data = await res.json()
    setSettings(data.settings)
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-400">
        <Loader size={20} className="mr-2 animate-spin" /> Carregando...
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-8">
      <div className="mb-8 flex items-center gap-3">
        <Settings size={24} className="text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Configurações</h1>
          <p className="mt-1 text-sm text-zinc-500">Gerencie suas preferências pessoais</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="mb-1 text-sm font-semibold text-zinc-900">Perfil</h3>
          <div className="mt-4 flex items-center gap-5">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-indigo-50 text-xl font-bold text-indigo-600">
                {photoUrl ? (
                  <img src={photoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  user?.name?.charAt(0).toUpperCase() ?? '?'
                )}
              </div>
              <button onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm hover:text-indigo-600"
              >
                <Camera size={12} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-900">{user?.name}</p>
              <p className="text-xs text-zinc-400">{user?.email}</p>
              <span className="inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-600">
                {ROLE_LABELS[user?.role as keyof typeof ROLE_LABELS] ?? user?.role}
              </span>
            </div>
            {uploading && <Loader size={16} className="animate-spin text-zinc-400" />}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Senha</h3>
              <p className="text-xs text-zinc-400">Altere sua senha de acesso</p>
            </div>
            <button onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
            >
              <Key size={14} />
              {showPasswordForm ? 'Cancelar' : 'Alterar Senha'}
            </button>
          </div>
          {showPasswordForm && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-500">
                Será enviado um email de redefinição para <strong>{user?.email}</strong>
              </p>
              <button onClick={handlePasswordReset}
                className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-zinc-800"
              >
                <Key size={14} />
                Enviar Email de Redefinição
              </button>
              {passwordMsg && (
                <p className={`text-xs ${passwordMsg.includes('Erro') ? 'text-red-500' : 'text-green-600'}`}>
                  {passwordMsg}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="mb-1 text-sm font-semibold text-zinc-900">Notificações</h3>
          <p className="mb-4 text-xs text-zinc-400">Escolha sobre o que você quer ser notificado</p>
          <div className="space-y-4">
            {[
              { key: 'notifyTaskAssigned' as const, label: 'Tarefas atribuídas a mim', desc: 'Quando alguém me atribuir uma tarefa' },
              { key: 'notifyDeadline' as const, label: 'Prazos próximos', desc: 'Quando uma tarefa estiver perto do prazo' },
              { key: 'notifyChecklist' as const, label: 'Checklist', desc: 'Quando itens do checklist forem atualizados' },
            ].map(item => (
              <label key={item.key} className="flex cursor-pointer items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-700">{item.label}</p>
                  <p className="text-xs text-zinc-400">{item.desc}</p>
                </div>
                <button
                  onClick={() => handleToggle(item.key)}
                  disabled={saving}
                  className={`relative h-6 w-11 rounded-full transition-all ${
                    settings?.[item.key] ? 'bg-indigo-600' : 'bg-zinc-300'
                  } ${saving ? 'opacity-50' : ''}`}
                >
                  <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    settings?.[item.key] ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
