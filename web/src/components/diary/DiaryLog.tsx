'use client'

import { useState, useEffect } from 'react'
import {
  BookOpen, FileText, Video, Code, Image, Trash2, Plus, X, FileDown,
  Clock, MapPin, Users, Wrench, ListChecks, GitBranch, Lightbulb,
  AlertTriangle, Target, ArrowRight, Search, BookMarked,
} from 'lucide-react'
import type { DiaryEntry } from '@/lib/types'

const ATTACHMENT_ICONS: Record<string, typeof FileText> = {
  foto: Image, video: Video, codigo: Code, documento: FileText,
}

const ATTACHMENT_COLORS: Record<string, string> = {
  foto: 'text-purple-600 bg-purple-50',
  video: 'text-rose-600 bg-rose-50',
  codigo: 'text-green-600 bg-green-50',
  documento: 'text-blue-600 bg-blue-50',
}

interface FormData {
  date: string
  time: string
  location: string
  participants: string
  content: string
  materials: string
  procedures: string
  decisions: string
  learnings: string
  difficulties: string
  whatWorked: string
  nextSteps: string
  failedAttempts: string
  possibleCauses: string
  plannedAdjustments: string
  newHypotheses: string
}

const emptyForm: FormData = {
  date: new Date().toISOString().split('T')[0],
  time: '',
  location: '',
  participants: '',
  content: '',
  materials: '',
  procedures: '',
  decisions: '',
  learnings: '',
  difficulties: '',
  whatWorked: '',
  nextSteps: '',
  failedAttempts: '',
  possibleCauses: '',
  plannedAdjustments: '',
  newHypotheses: '',
}

function SectionLabel({ icon: Icon, label }: { icon: typeof BookOpen; label: string }) {
  return (
    <h4 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400">
      <Icon size={14} />
      {label}
    </h4>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-zinc-600">{label}</label>
      {children}
    </div>
  )
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  return (
    <textarea rows={rows} placeholder={placeholder}
      value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
    />
  )
}

function Input({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
    />
  )
}

function DisplaySection({ icon: Icon, label, content }: { icon: typeof BookOpen; label: string; content: string | string[] | undefined | null }) {
  if (!content || (typeof content === 'string' && !content.trim()) || (Array.isArray(content) && content.length === 0)) return null
  return (
    <div className="mt-4">
      <h5 className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        <Icon size={12} />
        {label}
      </h5>
      {Array.isArray(content) ? (
        <div className="flex flex-wrap gap-1.5">
          {content.map((item, i) => (
            <span key={i} className="rounded-md bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-700">{item}</span>
          ))}
        </div>
      ) : (
        <p className="whitespace-pre-wrap text-sm text-zinc-700">{content}</p>
      )}
    </div>
  )
}

export function DiaryLog() {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [error, setError] = useState('')

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleExportPDF() {
    const { default: jsPDF } = await import('jspdf')

    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    let cursorY = margin

    function addTitle(text: string, size: number, y: number) {
      doc.setFontSize(size)
      doc.text(text, pageWidth / 2, y, { align: 'center' })
      return y + size * 0.5
    }

    cursorY = addTitle('Diário de Bordo', 22, cursorY + 10)
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text('Projeto: Robô Educacional FEBRACE', pageWidth / 2, cursorY + 6, { align: 'center' })
    cursorY += 12
    doc.setTextColor(0)

    doc.setDrawColor(200)
    doc.line(margin, cursorY, pageWidth - margin, cursorY)
    cursorY += 8

    function writeField(label: string, value: string) {
      if (!value.trim()) return
      const lines = doc.splitTextToSize(`${label}: ${value}`, pageWidth - margin * 2)
      for (const line of lines) {
        if (cursorY > 275) { doc.addPage(); cursorY = margin + 10 }
        doc.text(line, margin, cursorY)
        cursorY += 5
      }
    }

    for (const entry of entries) {
      if (cursorY > 260) { doc.addPage(); cursorY = margin + 10 }

      doc.setFontSize(9)
      doc.setTextColor(79, 70, 229)
      doc.text(entry.date, margin, cursorY)
      if (entry.time) doc.text(entry.time, margin + 35, cursorY)
      doc.setFontSize(8)
      doc.setTextColor(160)
      doc.text(`por ${entry.author}`, margin + 55, cursorY)
      cursorY += 6

      doc.setFontSize(10)
      doc.setTextColor(50)

      writeField('Local', entry.location)
      if (entry.participants.length > 0) writeField('Integrantes', entry.participants.join(', '))
      writeField('O que foi feito', entry.content)
      writeField('Materiais', entry.materials)
      writeField('Procedimentos', entry.procedures)
      writeField('Decisões', entry.decisions)
      writeField('Aprendizados', entry.learnings)
      writeField('Dificuldades', entry.difficulties)
      writeField('O que funcionou', entry.whatWorked)
      writeField('Próximos passos', entry.nextSteps)
      writeField('Tentativas malsucedidas', entry.failedAttempts)
      writeField('Possíveis causas', entry.possibleCauses)
      writeField('Ajustes planejados', entry.plannedAdjustments)
      writeField('Novas hipóteses', entry.newHypotheses)

      cursorY += 4
      doc.setDrawColor(230)
      doc.line(margin, cursorY, pageWidth - margin, cursorY)
      cursorY += 6
    }

    doc.save('diario-de-bordo.pdf')
  }

  async function loadEntries() {
    setLoading(true)
    const res = await fetch('/api/diary')
    const data = await res.json()
    setEntries(data)
    setLoading(false)
  }

  useEffect(() => {
    let ignore = false
    fetch('/api/diary').then(res => res.json()).then(data => {
      if (!ignore) { setEntries(data); setLoading(false) }
    })
    return () => { ignore = true }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.content.trim()) {
      setError('A descrição da atividade é obrigatória')
      return
    }
    setError('')

    const participants = form.participants
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    const res = await fetch('/api/diary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        participants,
        time: form.time || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      }),
    })

    if (res.ok) {
      setForm(emptyForm)
      setShowForm(false)
      loadEntries()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover esta entrada do diário?')) return
    await fetch('/api/diary', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    loadEntries()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
          <BookOpen size={20} />
          Diário de Bordo
        </h2>
        <div className="flex items-center gap-2">
          {entries.length > 0 && (
            <button onClick={handleExportPDF}
              className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50"
            >
              <FileDown size={16} />
              Exportar PDF
            </button>
          )}
          <button onClick={() => { setShowForm(!showForm); setForm(emptyForm); setError('') }}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-zinc-800"
          >
            <Plus size={16} />
            Nova Entrada
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Nova Entrada</h3>
            <button type="button" onClick={() => setShowForm(false)}
              className="rounded p-1 text-zinc-400 hover:bg-zinc-100">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Cabeçalho */}
            <div>
              <SectionLabel icon={BookMarked} label="Cabeçalho" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Data">
                  <Input type="date" value={form.date} onChange={v => updateField('date', v)} />
                </Field>
                <Field label="Horário">
                  <Input type="time" value={form.time} onChange={v => updateField('time', v)} />
                </Field>
                <Field label="Local">
                  <Input value={form.location} onChange={v => updateField('location', v)} placeholder="Ex: Laboratório de IoT" />
                </Field>
                <Field label="Integrantes envolvidos">
                  <Input value={form.participants} onChange={v => updateField('participants', v)} placeholder="Nomes separados por vírgula" />
                </Field>
              </div>
            </div>

            {/* Descrição da Atividade */}
            <div className="border-t border-zinc-100 pt-6">
              <SectionLabel icon={ListChecks} label="Descrição da Atividade" />
              <div className="space-y-4">
                <Field label="O que foi feito">
                  <Textarea value={form.content} onChange={v => { updateField('content', v); setError('') }}
                    placeholder="Descreva as atividades realizadas" rows={4} />
                </Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Materiais utilizados">
                    <Textarea value={form.materials} onChange={v => updateField('materials', v)}
                      placeholder="Liste os materiais, componentes e softwares usados" />
                  </Field>
                  <Field label="Procedimentos realizados">
                    <Textarea value={form.procedures} onChange={v => updateField('procedures', v)}
                      placeholder="Descreva o passo a passo executado" />
                  </Field>
                </div>
                <Field label="Decisões tomadas">
                  <Textarea value={form.decisions} onChange={v => updateField('decisions', v)}
                    placeholder="Que decisões foram tomadas e por quê?" />
                </Field>
              </div>
            </div>

            {/* Reflexão */}
            <div className="border-t border-zinc-100 pt-6">
              <SectionLabel icon={Lightbulb} label="Reflexão" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="O que foi aprendido">
                  <Textarea value={form.learnings} onChange={v => updateField('learnings', v)}
                    placeholder="Novos conhecimentos adquiridos" />
                </Field>
                <Field label="Quais dificuldades surgiram">
                  <Textarea value={form.difficulties} onChange={v => updateField('difficulties', v)}
                    placeholder="Desafios enfrentados" />
                </Field>
                <Field label="O que funcionou / Precisa de ajuste">
                  <Textarea value={form.whatWorked} onChange={v => updateField('whatWorked', v)}
                    placeholder="O que deu certo e o que pode melhorar" />
                </Field>
                <Field label="Próximos passos">
                  <Textarea value={form.nextSteps} onChange={v => updateField('nextSteps', v)}
                    placeholder="O que será feito a seguir" />
                </Field>
              </div>
            </div>

            {/* Quando algo não deu certo */}
            <div className="border-t border-zinc-100 pt-6">
              <SectionLabel icon={AlertTriangle} label="Quando algo não deu certo" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Tentativas malsucedidas">
                  <Textarea value={form.failedAttempts} onChange={v => updateField('failedAttempts', v)}
                    placeholder="O que foi testado e não funcionou" />
                </Field>
                <Field label="Possíveis causas">
                  <Textarea value={form.possibleCauses} onChange={v => updateField('possibleCauses', v)}
                    placeholder="Hipóteses para o erro observado" />
                </Field>
                <Field label="Ajustes planejados">
                  <Textarea value={form.plannedAdjustments} onChange={v => updateField('plannedAdjustments', v)}
                    placeholder="O que será modificado na próxima tentativa" />
                </Field>
                <Field label="Novas hipóteses / soluções">
                  <Textarea value={form.newHypotheses} onChange={v => updateField('newHypotheses', v)}
                    placeholder="Ideias e alternativas a explorar" />
                </Field>
              </div>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800"
            >
              Salvar Entrada
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="py-8 text-center text-sm text-zinc-400">Carregando...</p>
      ) : entries.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-400">Nenhuma entrada no diário ainda.</p>
      ) : (
        <div className="space-y-4">
          {entries.map(entry => (
            <div key={entry.id} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-1 flex items-start justify-between">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-xs font-semibold text-indigo-600">{entry.date}</span>
                  {entry.time && (
                    <span className="flex items-center gap-1 text-xs text-zinc-400">
                      <Clock size={10} /> {entry.time}
                    </span>
                  )}
                  <span className="text-xs text-zinc-400">por {entry.author}</span>
                </div>
                <button onClick={() => handleDelete(entry.id)}
                  className="rounded p-1.5 text-zinc-300 hover:bg-red-50 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>

              {entry.location && (
                <div className="mt-2 flex items-center gap-1 text-xs text-zinc-400">
                  <MapPin size={10} /> {entry.location}
                </div>
              )}

              <DisplaySection icon={Users} label="Integrantes" content={entry.participants} />

              <div className="mt-4 space-y-3">
                <DisplaySection icon={ListChecks} label="O que foi feito" content={entry.content} />
                <DisplaySection icon={Wrench} label="Materiais" content={entry.materials} />
                <DisplaySection icon={GitBranch} label="Procedimentos" content={entry.procedures} />
                <DisplaySection icon={Target} label="Decisões" content={entry.decisions} />
                <DisplaySection icon={Lightbulb} label="Aprendizados" content={entry.learnings} />
                <DisplaySection icon={AlertTriangle} label="Dificuldades" content={entry.difficulties} />
                <DisplaySection icon={ArrowRight} label="O que funcionou / Ajustes" content={entry.whatWorked} />
                <DisplaySection icon={ArrowRight} label="Próximos passos" content={entry.nextSteps} />
                <DisplaySection icon={AlertTriangle} label="Tentativas malsucedidas" content={entry.failedAttempts} />
                <DisplaySection icon={Search} label="Possíveis causas" content={entry.possibleCauses} />
                <DisplaySection icon={Wrench} label="Ajustes planejados" content={entry.plannedAdjustments} />
                <DisplaySection icon={Lightbulb} label="Novas hipóteses" content={entry.newHypotheses} />
              </div>

              {entry.attachments.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-100 pt-4">
                  {entry.attachments.map(att => {
                    const Icon = ATTACHMENT_ICONS[att.type] || FileText
                    const colorClass = ATTACHMENT_COLORS[att.type] || 'text-zinc-600 bg-zinc-50'
                    return (
                      <a key={att.id} href={att.url}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${colorClass}`}
                      >
                        <Icon size={14} />
                        {att.name}
                      </a>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
