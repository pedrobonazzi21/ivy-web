'use client'

import { useState, useEffect } from 'react'
import { FlaskConical, Plus, Trash2, Edit3, X } from 'lucide-react'
import type { TestRecord } from '@/lib/types'
import { CommentSection } from '@/components/comments/CommentSection'

export function TestList() {
  const [tests, setTests] = useState<TestRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<TestRecord | null>(null)
  const [name, setName] = useState('')
  const [result, setResult] = useState(0)
  const [problem, setProblem] = useState('')
  const [solution, setSolution] = useState('')
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  async function loadTests() {
    setLoading(true)
    const res = await fetch('/api/tests')
    const data = await res.json()
    setTests(data)
    setLoading(false)
  }

  useEffect(() => { loadTests() }, [])

  function resetForm() {
    setName(''); setResult(0); setProblem(''); setSolution(''); setError(''); setEditing(null)
  }

  function openEdit(test: TestRecord) {
    setEditing(test); setName(test.name); setResult(test.result)
    setProblem(test.problem); setSolution(test.solution); setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Nome é obrigatório'); return }
    setError('')

    const body = { name: name.trim(), result, problem: problem.trim(), solution: solution.trim() }
    let res
    if (editing) {
      res = await fetch('/api/tests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing.id, ...body }),
      })
    } else {
      res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    }

    if (res.ok) { resetForm(); setShowForm(false); loadTests() }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este teste?')) return
    await fetch('/api/tests', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    loadTests()
  }

  const resultColor = (r: number) =>
    r >= 80 ? 'text-green-600' : r >= 50 ? 'text-amber-600' : 'text-red-600'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
          <FlaskConical size={20} />
          Registro de Testes
        </h2>
        <button onClick={() => { resetForm(); setShowForm(!showForm) }}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-zinc-800"
        >
          <Plus size={16} />
          Novo Teste
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              {editing ? 'Editar Teste' : 'Novo Teste'}
            </h3>
            <button type="button" onClick={() => { setShowForm(false); resetForm() }}
              className="rounded p-1 text-zinc-400 hover:bg-zinc-100"><X size={16} /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">Nome do Teste *</label>
              <input type="text" placeholder="Ex: Movimento dos motores"
                value={name} onChange={(e) => { setName(e.target.value); setError('') }}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">Resultado (%)</label>
              <input type="range" min={0} max={100} value={result} onChange={(e) => setResult(Number(e.target.value))}
                className="w-full" />
              <span className={`text-sm font-bold ${resultColor(result)}`}>{result}%</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">Problema</label>
                <input type="text" placeholder="Ex: Aquecimento"
                  value={problem} onChange={(e) => setProblem(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">Solução</label>
                <input type="text" placeholder="Ex: Adicionar dissipador"
                  value={solution} onChange={(e) => setSolution(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800"
            >
              {editing ? 'Salvar Alterações' : 'Registrar Teste'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="py-8 text-center text-sm text-zinc-400">Carregando...</p>
      ) : tests.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-400">Nenhum teste registrado.</p>
      ) : (
        <div className="space-y-4">
          {tests.map(test => (
            <div key={test.id} className="rounded-xl border border-zinc-200 bg-white shadow-sm">
              <div className="flex items-start justify-between p-5">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-sm font-semibold text-zinc-900">{test.name}</h4>
                    <span className={`text-lg font-bold ${resultColor(test.result)}`}>{test.result}%</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">por {test.createdBy} &middot; {test.createdAt}</p>
                  <div className="mt-3 flex gap-6 text-xs">
                    {test.problem && (
                      <div>
                        <span className="font-medium text-zinc-500">Problema:</span>
                        <p className="text-zinc-700">{test.problem}</p>
                      </div>
                    )}
                    {test.solution && (
                      <div>
                        <span className="font-medium text-zinc-500">Solução:</span>
                        <p className="text-green-700">{test.solution}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(test)}
                    className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"><Edit3 size={15} /></button>
                  <button onClick={() => handleDelete(test.id)}
                    className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={15} /></button>
                  <button onClick={() => setExpanded(expanded === test.id ? null : test.id)}
                    className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 text-xs font-medium">
                    {expanded === test.id ? 'Ocultar' : 'Comentários'}
                  </button>
                </div>
              </div>
              {expanded === test.id && (
                <div className="border-t border-zinc-100 px-5 py-4">
                  <CommentSection entityType="test" entityId={test.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
