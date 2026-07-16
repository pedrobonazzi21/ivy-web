'use client'

import { useState, useEffect } from 'react'
import { Cloud, FolderOpen, FileText, Download, ExternalLink, History, ChevronRight, Home, RotateCw, RefreshCw } from 'lucide-react'
import type { OneDriveItem, OneDriveVersion } from '@/lib/onedrive/store'

const MIME_ICONS: Record<string, typeof FileText> = {
  'application/pdf': FileText,
  'image/jpeg': FileText,
  'image/png': FileText,
  'video/mp4': FileText,
  'text/plain': FileText,
}

const FILE_COLORS: Record<string, string> = {
  pdf: 'text-red-600 bg-red-50',
  step: 'text-orange-600 bg-orange-50',
  docx: 'text-blue-600 bg-blue-50',
  pptx: 'text-orange-600 bg-orange-50',
  jpg: 'text-purple-600 bg-purple-50',
  jpeg: 'text-purple-600 bg-purple-50',
  png: 'text-purple-600 bg-purple-50',
  mp4: 'text-rose-600 bg-rose-50',
  cpp: 'text-green-600 bg-green-50',
  py: 'text-green-600 bg-green-50',
}

function getFileExtension(name: string): string {
  const parts = name.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

function getColor(name: string, isFolder: boolean): string {
  if (isFolder) return 'text-amber-600 bg-amber-50'
  return FILE_COLORS[getFileExtension(name)] || 'text-zinc-600 bg-zinc-50'
}

type OneDriveBrowserProps = {
  onImportFile?: (item: OneDriveItem) => void
}

export function OneDriveBrowser({ onImportFile }: OneDriveBrowserProps) {
  const [connected, setConnected] = useState(false)
  const [items, setItems] = useState<OneDriveItem[]>([])
  const [currentPath, setCurrentPath] = useState('/')
  const [loading, setLoading] = useState(true)
  const [versions, setVersions] = useState<OneDriveVersion[]>([])
  const [selectedFile, setSelectedFile] = useState<OneDriveItem | null>(null)
  const [showVersions, setShowVersions] = useState(false)
  const [connecting, setConnecting] = useState(false)

  async function loadFolder(path: string) {
    setLoading(true)
    const res = await fetch(`/api/onedrive/list?path=${encodeURIComponent(path)}`)
    const data = await res.json()
    if (data.connected === false) {
      setConnected(false)
      setItems([])
    } else {
      setConnected(true)
      setItems(data.items)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadFolder('/')
  }, [])

  async function handleConnect() {
    setConnecting(true)
    await fetch('/api/onedrive/connect', { method: 'POST' })
    setConnected(true)
    loadFolder('/')
    setConnecting(false)
  }

  async function loadVersions(fileId: string) {
    const res = await fetch(`/api/onedrive/versions?fileId=${fileId}`)
    const data = await res.json()
    setVersions(data.versions || [])
  }

  function navigateTo(folder: OneDriveItem) {
    if (folder.type !== 'folder') return
    setCurrentPath(folder.path)
    loadFolder(folder.path)
    setSelectedFile(null)
    setShowVersions(false)
  }

  function navigateHome() {
    setCurrentPath('/')
    loadFolder('/')
    setSelectedFile(null)
    setShowVersions(false)
  }

  function selectFile(item: OneDriveItem) {
    if (item.type === 'folder') return
    setSelectedFile(item)
    setShowVersions(false)
    loadVersions(item.id)
  }

  const pathParts = currentPath.split('/').filter(Boolean)

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 py-16">
        <Cloud size={48} className="text-zinc-300 mb-4" />
        <h3 className="text-lg font-semibold text-zinc-700 mb-2">OneDrive não conectado</h3>
        <p className="text-sm text-zinc-500 mb-6 text-center max-w-md">
          Conecte sua conta Microsoft para acessar os arquivos do OneDrive diretamente pela plataforma.
        </p>
        <button
          onClick={handleConnect} disabled={connecting}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-700 disabled:opacity-50"
        >
          <Cloud size={18} />
          {connecting ? 'Conectando...' : 'Conectar OneDrive'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <button onClick={navigateHome} className="rounded p-1 hover:bg-zinc-100">
            <Home size={16} />
          </button>
          {pathParts.map((part, i) => (
            <span key={i} className="flex items-center gap-1">
              <ChevronRight size={14} className="text-zinc-300" />
              <span className={`font-medium ${i === pathParts.length - 1 ? 'text-zinc-900' : 'text-zinc-500'}`}>
                {part}
              </span>
            </span>
          ))}
        </div>
        <button onClick={() => loadFolder(currentPath)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100">
          <RefreshCw size={14} />
          Atualizar
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className={`${selectedFile ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          {loading ? (
            <p className="py-8 text-center text-sm text-zinc-400">Carregando...</p>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-400">Pasta vazia</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {items.map(item => {
                const isFolder = item.type === 'folder'
                const color = getColor(item.name, isFolder)
                const ext = getFileExtension(item.name)
                const isSelected = selectedFile?.id === item.id

                return (
                  <div
                    key={item.id}
                    onClick={() => isFolder ? navigateTo(item) : selectFile(item)}
                    className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm'
                    }`}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color}`}>
                      {isFolder ? <FolderOpen size={20} /> : <FileText size={20} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-900">{item.name}</p>
                      {!isFolder && (
                        <p className="text-[10px] text-zinc-400">
                          {item.lastModifiedBy} &middot; v{item.fileVersion}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${getColor(selectedFile.name, false)}`}>
                  <FileText size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-zinc-900 truncate">{selectedFile.name}</h4>
                  <p className="text-xs text-zinc-400">
                    {selectedFile.lastModifiedBy} &middot; v{selectedFile.fileVersion}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-zinc-500">
                  Última modificação: {selectedFile.lastModifiedAt}
                </p>
                {selectedFile.size && (
                  <p className="text-xs text-zinc-500">
                    Tamanho: {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <a href={selectedFile.webUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50">
                  <ExternalLink size={14} />
                  Abrir OneDrive
                </a>
                <a href={selectedFile.downloadUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50">
                  <Download size={14} />
                  Baixar
                </a>
                <button onClick={() => { setShowVersions(!showVersions); if (!showVersions) loadVersions(selectedFile.id) }}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium ${
                    showVersions ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-zinc-300 text-zinc-700 hover:bg-zinc-50'
                  }`}>
                  <History size={14} />
                  Versões
                </button>
              </div>

              {onImportFile && (
                <button
                  onClick={() => onImportFile(selectedFile)}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-zinc-800"
                >
                  <Download size={16} />
                  Importar para o Projeto
                </button>
              )}
            </div>

            {showVersions && (
              <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                <h4 className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
                  <History size={14} />
                  Histórico de Versões
                </h4>
                <div className="space-y-2">
                  {versions.length === 0 ? (
                    <p className="text-xs text-zinc-400">Nenhuma versão anterior.</p>
                  ) : (
                    versions.map(v => (
                      <div key={v.id} className="flex items-center gap-3 rounded-lg bg-zinc-50 p-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded bg-indigo-100 text-[10px] font-bold text-indigo-700">
                          {v.version}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-zinc-700">{v.lastModifiedBy}</p>
                          <p className="text-[10px] text-zinc-400">{v.lastModifiedAt}</p>
                        </div>
                        <span className="text-[10px] text-zinc-400">{(v.size / 1024).toFixed(0)} KB</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
