'use client'

import { useState, useEffect } from 'react'
import { FileText, RefreshCw, ExternalLink, Loader, Eye, FileSpreadsheet, FileSliders } from 'lucide-react'

type DriveLink = {
  id: string
  fileId: string
  fileName: string
  mimeType: string
  webUrl: string
  linkedBy: string
  linkedAt: string
  lastSyncedAt: string
  lastModifiedAt: string
  content: string
}

function isHtmlDoc(mimeType: string) {
  return mimeType.includes('document') && mimeType.includes('google')
}

function isSpreadsheet(mimeType: string) {
  return mimeType.includes('spreadsheet') && mimeType.includes('google')
}

function wrapHtmlContent(html: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #1a1a1a;
      padding: 40px;
      margin: 0;
    }
    p { margin: 0 0 0.5em 0; min-height: 1.2em; }
    h1, h2, h3, h4 { margin: 0.8em 0 0.3em 0; font-weight: 600; }
    ul, ol { margin: 0.3em 0; padding-left: 2em; }
    li { margin: 0.2em 0; }
    img { max-width: 100%; height: auto; }
    table { border-collapse: collapse; width: 100%; margin: 0.5em 0; }
    td, th { border: 1px solid #ccc; padding: 6px 8px; }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>${html}</body>
</html>`
}

export function GoogleDriveViewer() {
  const [links, setLinks] = useState<DriveLink[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<DriveLink | null>(null)
  const [syncing, setSyncing] = useState<string | null>(null)

  async function loadLinks() {
    setLoading(true)
    const res = await fetch('/api/google/link')
    const data = await res.json()
    setLinks(data.links || [])
    setLoading(false)
  }

  useEffect(() => { loadLinks() }, [])

  async function syncOne(link: DriveLink) {
    setSyncing(link.id)
    await fetch('/api/google/sync', { method: 'POST' })
    await loadLinks()
    setSyncing(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-zinc-400">
        <Loader size={20} className="mr-2 animate-spin" /> Carregando...
      </div>
    )
  }

  if (links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 py-12">
        <Eye size={40} className="text-zinc-300 mb-3" />
        <p className="text-sm text-zinc-500">Nenhum documento vinculado</p>
        <p className="text-xs text-zinc-400 mt-1">Vá em Google Drive para vincular documentos</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
          <FileText size={16} />
          Documentos Sincronizados ({links.length})
        </h3>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-2">
          {links.map(link => (
            <button key={link.id} onClick={() => setSelected(link)}
              className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                selected?.id === link.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-zinc-200 bg-white hover:border-zinc-300'
              }`}>
              {isHtmlDoc(link.mimeType) ? (
                <FileText size={18} className="shrink-0 text-indigo-500" />
              ) : isSpreadsheet(link.mimeType) ? (
                <FileSpreadsheet size={18} className="shrink-0 text-green-500" />
              ) : (
                <FileSliders size={18} className="shrink-0 text-amber-500" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-800">{link.fileName}</p>
                <p className="text-[10px] text-zinc-400">
                  {link.lastSyncedAt || link.linkedAt}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <h4 className="truncate font-semibold text-zinc-900">{selected.fileName}</h4>
                  <p className="text-xs text-zinc-400">
                    Sincronizado em {selected.lastSyncedAt || selected.linkedAt}
                  </p>
                </div>
                <div className="ml-4 flex gap-2 shrink-0">
                  <button onClick={() => syncOne(selected)} disabled={syncing === selected.id}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50 disabled:opacity-50">
                    <RefreshCw size={14} className={syncing === selected.id ? 'animate-spin' : ''} />
                    {syncing === selected.id ? 'Sincronizando...' : 'Sincronizar'}
                  </button>
                  <a href={selected.webUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50">
                    <ExternalLink size={14} />
                    Abrir no Drive
                  </a>
                </div>
              </div>

              <div className="p-6">
                {selected.content ? (
                  isHtmlDoc(selected.mimeType) ? (
                    <div className="flex justify-center">
                      <div className="w-full max-w-[210mm] overflow-hidden rounded-md shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
                        <iframe
                          srcDoc={wrapHtmlContent(selected.content)}
                          className="w-full bg-white"
                          style={{ height: '70vh', border: 'none' }}
                          title={selected.fileName}
                          sandbox="allow-same-origin"
                        />
                      </div>
                    </div>
                  ) : (
                    <pre className="max-h-[70vh] overflow-y-auto whitespace-pre-wrap rounded-lg bg-zinc-50 p-4 font-mono text-xs leading-relaxed text-zinc-700">
                      {selected.content}
                    </pre>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg bg-zinc-50 py-12">
                    <Eye size={32} className="text-zinc-300 mb-2" />
                    <p className="text-sm text-zinc-400">Conteúdo não sincronizado</p>
                    <button onClick={() => syncOne(selected)}
                      className="mt-3 flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs text-white hover:bg-indigo-700">
                      <RefreshCw size={14} />
                      Sincronizar agora
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-16">
              <Eye size={32} className="text-zinc-300 mb-2" />
              <p className="text-sm text-zinc-400">Selecione um documento ao lado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
