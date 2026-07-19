'use client'

import { useState, useEffect, useCallback } from 'react'
import { Cloud, FileText, Link as LinkIcon, ExternalLink, Trash2, RefreshCw, Loader, AlertCircle, CheckCircle } from 'lucide-react'
import type { GoogleDriveFile } from '@/lib/google'

type DriveLink = {
  id: string
  fileId: string
  fileName: string
  mimeType: string
  webUrl: string
  linkedBy: string
  linkedAt: string
  lastSyncedAt: string
}

export function GoogleDriveBrowser() {
  const [connected, setConnected] = useState(false)
  const [files, setFiles] = useState<GoogleDriveFile[]>([])
  const [links, setLinks] = useState<DriveLink[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [status, setStatus] = useState('')

  const loadFiles = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/google/files')
    const data = await res.json()
    if (data.connected) {
      setConnected(true)
      setFiles(data.files || [])
    } else {
      setConnected(false)
    }
    setLoading(false)
  }, [])

  async function loadLinks() {
    const res = await fetch('/api/google/link')
    const data = await res.json()
    setLinks(data.links || [])
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === 'connected') {
      setStatus('Google Drive conectado com sucesso!')
      window.history.replaceState({}, '', '/projeto/google')
    } else if (params.get('error') === 'token_failed') {
      setStatus('Erro ao obter token. Tente novamente.')
    } else if (params.get('error') === 'auth_failed') {
      setStatus('Autorização cancelada ou falhou.')
    }
    loadFiles()
    loadLinks()
  }, [loadFiles])

  async function handleLink(file: GoogleDriveFile) {
    const res = await fetch('/api/google/link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileId: file.id,
        fileName: file.name,
        mimeType: file.mimeType,
        webUrl: file.webViewLink,
      }),
    })
    if (res.ok) {
      setStatus(`"${file.name}" vinculado com sucesso`)
      loadLinks()
    } else {
      const data = await res.json()
      setStatus(data.error || 'Erro ao vincular')
    }
  }

  async function handleUnlink(id: string, fileName: string) {
    const res = await fetch('/api/google/link', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      setStatus(`"${fileName}" removido`)
      loadLinks()
    }
  }

  async function handleSyncAll() {
    setSyncing(true)
    setStatus('Sincronizando...')
    await fetch('/api/google/sync', { method: 'POST' })
    setStatus('Sincronização concluída')
    loadLinks()
    setSyncing(false)
  }

  async function handleConnect() {
    window.location.href = '/api/google/auth'
  }

  async function handleDisconnect() {
    await fetch('/api/google/disconnect', { method: 'POST' })
    setConnected(false)
    setFiles([])
    setLinks([])
    setStatus('Google Drive desconectado')
  }

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 py-16">
        <Cloud size={48} className="text-zinc-300 mb-4" />
        <h3 className="text-lg font-semibold text-zinc-700 mb-2">Google Drive não conectado</h3>
        <p className="text-sm text-zinc-500 mb-6 text-center max-w-md">
          Conecte o Google Drive para acessar documentos e sincronizar alterações automaticamente.
        </p>
        <button onClick={handleConnect}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-700">
          <Cloud size={18} />
          Conectar Google Drive
        </button>
      </div>
    )
  }

  const linkedFileIds = new Set(links.map(l => l.fileId))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Cloud size={24} className="text-indigo-600" />
          <h2 className="text-lg font-semibold text-zinc-900">Google Drive</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={loadFiles} disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
          <button onClick={handleSyncAll} disabled={syncing}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs text-white hover:bg-indigo-700 disabled:opacity-50">
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Sincronizando...' : 'Sincronizar tudo'}
          </button>
          <button onClick={handleDisconnect}
            className="rounded-lg border border-red-300 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">
            Desconectar
          </button>
        </div>
      </div>

      {status && (
        <p className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm ${
          status.includes('sucesso')
            ? 'bg-green-50 text-green-700'
            : status.includes('Erro')
              ? 'bg-red-50 text-red-700'
              : 'bg-indigo-50 text-indigo-700'
        }`}>
          {status.includes('sucesso') ? <CheckCircle size={16} /> : status.includes('Erro') ? <AlertCircle size={16} /> : null}
          {status}
        </p>
      )}

      {links.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-700">
            <LinkIcon size={16} />
            Documentos Vinculados ({links.length})
          </h3>
          <div className="space-y-2">
            {links.map(link => (
              <div key={link.id} className="flex items-center gap-3 rounded-lg border border-zinc-100 bg-zinc-50 p-3">
                <FileText size={18} className="text-indigo-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-800 truncate">{link.fileName}</p>
                  <p className="text-xs text-zinc-400">
                    {link.linkedBy} &middot; {link.lastSyncedAt || link.linkedAt}
                  </p>
                </div>
                <a href={link.webUrl} target="_blank" rel="noopener noreferrer"
                  className="rounded p-1.5 text-zinc-400 hover:text-indigo-600">
                  <ExternalLink size={15} />
                </a>
                <button onClick={() => handleUnlink(link.id, link.fileName)}
                  className="rounded p-1.5 text-zinc-400 hover:text-red-600">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-zinc-700">Arquivos no Drive</h3>
        {loading ? (
          <p className="flex items-center justify-center gap-2 py-8 text-sm text-zinc-400">
            <Loader size={16} className="animate-spin" /> Carregando...
          </p>
        ) : files.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-400">Nenhum arquivo encontrado</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {files.map(file => {
              const isLinked = linkedFileIds.has(file.id)
              return (
                <div key={file.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
                    isLinked ? 'border-indigo-300 bg-indigo-50' : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}>
                  <FileText size={20} className={`shrink-0 ${isLinked ? 'text-indigo-500' : 'text-zinc-400'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900">{file.name}</p>
                    <p className="text-[10px] text-zinc-400">
                      {file.modifiedTime ? new Date(file.modifiedTime).toLocaleString('pt-BR') : ''}
                      {file.size ? ` · ${(Number(file.size) / 1024).toFixed(0)} KB` : ''}
                    </p>
                  </div>
                  {isLinked ? (
                    <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                      Vinculado
                    </span>
                  ) : (
                    <button onClick={() => handleLink(file)}
                      className="flex items-center gap-1 rounded bg-zinc-900 px-2.5 py-1.5 text-[10px] font-medium text-white hover:bg-zinc-800">
                      <LinkIcon size={12} />
                      Vincular
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
