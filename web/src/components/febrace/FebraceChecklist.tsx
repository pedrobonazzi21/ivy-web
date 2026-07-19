'use client'

import { useState, useEffect } from 'react'
import { ClipboardCheck, Check, Loader, Plus, X, Trash2, ChevronDown, ChevronUp, FileDown, User, StickyNote } from 'lucide-react'
import type { ChecklistItem } from '@/lib/types'
import { CHECKLIST_CATEGORIES, CHECKLIST_CATEGORY_LABELS, CHECKLIST_CATEGORY_ORDER } from '@/lib/types'

export function FebraceChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formLabel, setFormLabel] = useState('')
  const [formCategory, setFormCategory] = useState('personalizado')
  const [formCustomCategory, setFormCustomCategory] = useState('')
  const [formResponsible, setFormResponsible] = useState('')
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null)
  const [editNotes, setEditNotes] = useState('')
  const [editLabel, setEditLabel] = useState<string | null>(null)
  const [editLabelValue, setEditLabelValue] = useState('')

  async function loadItems() {
    const res = await fetch('/api/checklist')
    setItems(await res.json())
    setLoading(false)
  }

  useEffect(() => { loadItems() }, [])

  async function handleToggle(item: ChecklistItem) {
    await fetch('/api/checklist', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, done: !item.done }),
    })
    loadItems()
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault()
    if (!formLabel.trim()) return

    const category = formCategory === 'personalizado' && formCustomCategory.trim()
      ? formCustomCategory.trim()
      : formCategory

    await fetch('/api/checklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        label: formLabel.trim(),
        category,
        responsible: formResponsible.trim(),
      }),
    })

    setFormLabel('')
    setFormCategory('personalizado')
    setFormCustomCategory('')
    setFormResponsible('')
    setShowForm(false)
    loadItems()
  }

  async function handleDelete(id: string) {
    await fetch('/api/checklist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    loadItems()
  }

  async function handleSaveNotes(id: string) {
    await fetch('/api/checklist', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, notes: editNotes }),
    })
    setExpandedNotes(null)
    loadItems()
  }

  async function handleSaveLabel(id: string) {
    if (!editLabelValue.trim()) return
    await fetch('/api/checklist', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, label: editLabelValue.trim() }),
    })
    setEditLabel(null)
    loadItems()
  }

  async function handleExportPDF() {
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF({ format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()

    doc.setFontSize(18)
    doc.text('Checklist FEBRACE', pageWidth / 2, 20, { align: 'center' })
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, 28, { align: 'center' })

    const doneCount = items.filter(i => i.done).length
    const progress = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0
    doc.text(`Progresso: ${doneCount}/${items.length} (${progress}%)`, pageWidth / 2, 36, { align: 'center' })

    let y = 48
    doc.setFontSize(11)
    doc.setTextColor(50)

    for (const cat of CHECKLIST_CATEGORY_ORDER) {
      const catItems = items.filter(i => i.category === cat)
      if (catItems.length === 0) continue

      if (y > 260) { doc.addPage(); y = 20 }
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text(CHECKLIST_CATEGORY_LABELS[cat] ?? cat, 15, y)
      y += 8
      doc.setFont('helvetica', 'normal')

      for (const item of catItems) {
        if (y > 270) { doc.addPage(); y = 20 }
        const status = item.done ? '[✓]' : '[ ]'
        doc.setFontSize(10)
        doc.text(`${status} ${item.label}`, 20, y)
        if (item.responsible) {
          doc.setFontSize(8)
          doc.setTextColor(120)
          doc.text(`Responsável: ${item.responsible}`, 25, y + 4)
          y += 8
        } else {
          y += 6
        }
        doc.setTextColor(50)
      }
    }

    doc.save('checklist_febrace.pdf')
  }

  const doneCount = items.filter(i => i.done).length
  const progress = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0

  const allCategories = [...new Set(items.map(i => i.category))]
  const orderedCategories = [...CHECKLIST_CATEGORY_ORDER.filter(c => allCategories.includes(c)), ...allCategories.filter(c => !CHECKLIST_CATEGORY_ORDER.includes(c))]

  const grouped = orderedCategories.map(cat => ({
    category: cat,
    label: CHECKLIST_CATEGORY_LABELS[cat] ?? cat,
    items: items.filter(i => i.category === cat),
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-zinc-400">
        <Loader size={20} className="mr-2 animate-spin" /> Carregando...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ClipboardCheck size={24} className="text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Checklist FEBRACE</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Acompanhe o que já foi feito e o que ainda falta para a submissão
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportPDF}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 transition-all hover:bg-zinc-50"
          >
            <FileDown size={14} />
            Exportar PDF
          </button>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-zinc-800"
          >
            <Plus size={16} />
            Adicionar Item
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-700">Progresso geral</span>
          <span className="text-sm font-semibold text-indigo-600">{doneCount}/{items.length}</span>
        </div>
        <div className="h-3 rounded-full bg-zinc-100">
          <div className="h-3 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAddItem} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Novo Item</h3>
            <button type="button" onClick={() => setShowForm(false)} className="rounded p-1 text-zinc-400 hover:bg-zinc-100">
              <X size={16} />
            </button>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Item</label>
            <input type="text" placeholder="Ex: Banner impresso" value={formLabel} onChange={(e) => setFormLabel(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">Categoria</label>
              <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
              >
                {CHECKLIST_CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              {formCategory === 'personalizado' && (
                <input type="text" placeholder="Nome da nova categoria" value={formCustomCategory} onChange={(e) => setFormCustomCategory(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">Responsável</label>
              <input type="text" placeholder="Nome do responsável" value={formResponsible} onChange={(e) => setFormResponsible(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
          <button type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800"
          >
            <Plus size={16} />
            Adicionar
          </button>
        </form>
      )}

      <div className="space-y-4">
        {grouped.map(group => {
          if (group.items.length === 0) return null
          const groupDone = group.items.filter(i => i.done).length
          return (
            <div key={group.category} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {group.label}
                </h3>
                <span className="text-xs font-medium text-indigo-600">{groupDone}/{group.items.length}</span>
              </div>
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <div key={item.id}
                    className="group rounded-lg transition-all hover:bg-zinc-50"
                  >
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <button onClick={() => handleToggle(item)}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
                          item.done
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-zinc-300 hover:border-indigo-400'
                        }`}
                      >
                        {item.done && <Check size={12} />}
                      </button>

                      <div className="flex-1 min-w-0">
                        {editLabel === item.id ? (
                          <div className="flex items-center gap-1">
                            <input type="text" value={editLabelValue} onChange={(e) => setEditLabelValue(e.target.value)}
                              className="flex-1 rounded border border-indigo-300 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-100"
                              autoFocus
                              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveLabel(item.id); if (e.key === 'Escape') setEditLabel(null) }}
                            />
                            <button onClick={() => handleSaveLabel(item.id)} className="text-xs text-indigo-600 font-medium">salvar</button>
                            <button onClick={() => setEditLabel(null)} className="text-xs text-zinc-400">cancelar</button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditLabel(item.id); setEditLabelValue(item.label) }}
                            className={`block text-left text-sm ${item.done ? 'text-zinc-400 line-through' : 'text-zinc-700'} hover:text-indigo-600`}
                          >
                            {item.label}
                          </button>
                        )}

                        <div className="flex items-center gap-3 mt-0.5">
                          {item.responsible && (
                            <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                              <User size={10} />
                              {item.responsible}
                            </span>
                          )}
                          {item.updatedBy && (
                            <span className="text-[10px] text-zinc-400">
                              {item.done ? '✓ ' : ''}{item.updatedBy}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.notes !== undefined && (
                          <button onClick={() => {
                            if (expandedNotes === item.id) {
                              setExpandedNotes(null)
                            } else {
                              setExpandedNotes(item.id)
                              setEditNotes(item.notes)
                            }
                          }}
                            className={`rounded p-1.5 transition-all ${item.notes ? 'text-amber-500' : 'text-zinc-400 hover:text-zinc-600'}`}
                            title="Notas"
                          >
                            <StickyNote size={14} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(item.id)}
                          className="rounded p-1.5 text-zinc-400 hover:text-red-500"
                          title="Remover"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {expandedNotes === item.id && (
                      <div className="mx-3 mb-2 rounded-lg border border-zinc-100 bg-zinc-50 p-3">
                        <textarea rows={2} placeholder="Adicionar notas..." value={editNotes} onChange={(e) => setEditNotes(e.target.value)}
                          className="w-full rounded border border-zinc-200 px-3 py-2 text-xs outline-none focus:border-indigo-400 resize-none"
                        />
                        <div className="mt-2 flex justify-end gap-2">
                          <button onClick={() => setExpandedNotes(null)}
                            className="rounded px-3 py-1 text-xs text-zinc-500 hover:bg-zinc-200"
                          >
                            Cancelar
                          </button>
                          <button onClick={() => handleSaveNotes(item.id)}
                            className="rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                          >
                            Salvar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
