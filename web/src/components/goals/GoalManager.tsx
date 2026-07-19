'use client'

import { useState, useEffect } from 'react'
import { Target, Plus, X, Trash2, Check, Loader, Pencil, CalendarDays, Filter } from 'lucide-react'
import type { Goal, GoalStatus, Task } from '@/lib/types'
import { GOAL_STATUS_LABELS, GOAL_STATUS_COLORS, GOAL_STATUS_BG } from '@/lib/types'

const STATUS_OPTIONS: GoalStatus[] = ['nao_iniciada', 'em_andamento', 'concluida']
const FILTER_OPTIONS = [
  { value: 'todas', label: 'Todas' },
  ...STATUS_OPTIONS.map(s => ({ value: s, label: GOAL_STATUS_LABELS[s] })),
]

export function GoalManager() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editGoal, setEditGoal] = useState<Goal | null>(null)
  const [filter, setFilter] = useState<string>('todas')
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formStatus, setFormStatus] = useState<GoalStatus>('nao_iniciada')
  const [formDeadline, setFormDeadline] = useState('')
  const [formItems, setFormItems] = useState<{ label: string; taskId: string }[]>([{ label: '', taskId: '' }])

  async function loadGoals() {
    const res = await fetch('/api/metas')
    setGoals(await res.json())
    setLoading(false)
  }

  async function loadTasks() {
    try {
      const res = await fetch('/api/tasks')
      setTasks(await res.json())
    } catch {}
  }

  useEffect(() => { loadGoals(); loadTasks() }, [])

  function openCreateForm() {
    setEditGoal(null)
    setFormTitle('')
    setFormDesc('')
    setFormStatus('nao_iniciada')
    setFormDeadline('')
    setFormItems([{ label: '', taskId: '' }])
    setShowForm(true)
  }

  function openEditForm(goal: Goal) {
    setEditGoal(goal)
    setFormTitle(goal.title)
    setFormDesc(goal.description)
    setFormStatus(goal.status as GoalStatus)
    setFormDeadline(goal.deadline)
    setFormItems(goal.items.map(i => ({ label: i.label, taskId: i.taskId })))
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditGoal(null)
    setFormTitle('')
    setFormDesc('')
    setFormStatus('nao_iniciada')
    setFormDeadline('')
    setFormItems([{ label: '', taskId: '' }])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formTitle.trim()) return

    const items = formItems.filter(i => i.label.trim())

    if (editGoal) {
      await fetch('/api/metas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editGoal.id,
          title: formTitle.trim(),
          description: formDesc.trim(),
          status: formStatus,
          deadline: formDeadline,
          items: items.map((item, i) => ({
            id: editGoal.items[i]?.id ?? crypto.randomUUID(),
            label: item.label.trim(),
            taskId: item.taskId,
            done: editGoal.items[i]?.done ?? false,
          })),
        }),
      })
    } else {
      await fetch('/api/metas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle.trim(),
          description: formDesc.trim(),
          status: formStatus,
          deadline: formDeadline,
          items: items.map(i => i.label.trim()),
        }),
      })
    }

    closeForm()
    loadGoals()
  }

  async function handleToggleItem(itemId: string, done: boolean) {
    await fetch('/api/metas', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, done: !done }),
    })
    loadGoals()
  }

  async function handleDeleteGoal(id: string) {
    await fetch('/api/metas', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    loadGoals()
  }

  function calcProgress(items: { done: boolean }[]) {
    if (items.length === 0) return 0
    return Math.round((items.filter(i => i.done).length / items.length) * 100)
  }

  function getTaskTitle(taskId: string) {
    return tasks.find(t => t.id === taskId)?.title
  }

  const filteredGoals = filter === 'todas'
    ? goals
    : goals.filter(g => g.status === filter)

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
          <Target size={24} className="text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Metas</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Acompanhe o progresso dos grandes objetivos do projeto
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1">
            <Filter size={14} className="ml-2 text-zinc-400" />
            {FILTER_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setFilter(opt.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  filter === opt.value
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-500 hover:bg-zinc-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button onClick={openCreateForm}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-zinc-800"
          >
            <Plus size={16} />
            Nova Meta
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              {editGoal ? 'Editar Meta' : 'Nova Meta'}
            </h3>
            <button type="button" onClick={closeForm} className="rounded p-1 text-zinc-400 hover:bg-zinc-100">
              <X size={16} />
            </button>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Título da Meta</label>
            <input type="text" placeholder="Ex: Finalizar Protótipo" value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Descrição</label>
            <textarea rows={2} placeholder="Descrição da meta..." value={formDesc} onChange={(e) => setFormDesc(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">Status</label>
              <div className="flex gap-1">
                {(STATUS_OPTIONS as GoalStatus[]).map(s => (
                  <button key={s} type="button" onClick={() => setFormStatus(s)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                      formStatus === s
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    {GOAL_STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">Prazo</label>
              <input type="date" value={formDeadline} onChange={(e) => setFormDeadline(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Itens para conclusão</label>
            <div className="space-y-2">
              {formItems.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="flex-1 space-y-1">
                    <input type="text" placeholder={`Item ${i + 1}`} value={item.label} onChange={(e) => {
                      const next = [...formItems]
                      next[i] = { ...next[i], label: e.target.value }
                      setFormItems(next)
                    }}
                      className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                    <select value={item.taskId} onChange={(e) => {
                      const next = [...formItems]
                      next[i] = { ...next[i], taskId: e.target.value }
                      setFormItems(next)
                    }}
                      className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-500 outline-none focus:border-indigo-500"
                    >
                      <option value="">Sem tarefa vinculada</option>
                      {tasks.map(t => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </select>
                  </div>
                  {formItems.length > 1 && (
                    <button type="button" onClick={() => setFormItems(formItems.filter((_, j) => j !== i))}
                      className="mt-2 rounded p-1 text-zinc-400 hover:text-red-500"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setFormItems([...formItems, { label: '', taskId: '' }])}
              className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              + Adicionar item
            </button>
          </div>
          <button type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800"
          >
            <Plus size={16} />
            {editGoal ? 'Salvar Alterações' : 'Criar Meta'}
          </button>
        </form>
      )}

      {filteredGoals.length === 0 && !showForm && (
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center shadow-sm">
          <Target size={40} className="mx-auto mb-3 text-zinc-300" />
          <p className="text-sm text-zinc-500">
            {filter === 'todas' ? 'Nenhuma meta criada ainda' : 'Nenhuma meta com esse status'}
          </p>
          <p className="text-xs text-zinc-400 mt-1">Crie metas para acompanhar grandes objetivos do projeto</p>
        </div>
      )}

      <div className="space-y-4">
        {filteredGoals.map(goal => {
          const progress = calcProgress(goal.items)
          return (
            <div key={goal.id} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-zinc-900 truncate">{goal.title}</h3>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${GOAL_STATUS_BG[goal.status as GoalStatus]} ${GOAL_STATUS_COLORS[goal.status as GoalStatus]}`}>
                      {GOAL_STATUS_LABELS[goal.status as GoalStatus]}
                    </span>
                  </div>
                  {goal.description && (
                    <p className="text-sm text-zinc-500 truncate">{goal.description}</p>
                  )}
                  {goal.deadline && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-zinc-400">
                      <CalendarDays size={12} />
                      Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="text-xs font-semibold text-indigo-600">{progress}%</span>
                  <button onClick={() => openEditForm(goal)}
                    className="rounded p-1 text-zinc-400 hover:text-indigo-600"
                  >
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDeleteGoal(goal.id)}
                    className="rounded p-1 text-zinc-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="mb-4 h-2 rounded-full bg-zinc-100">
                <div className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="space-y-1">
                {goal.items.map(item => {
                  const taskTitle = getTaskTitle(item.taskId)
                  return (
                    <label key={item.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-zinc-50"
                    >
                      <button onClick={() => handleToggleItem(item.id, item.done)}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
                          item.done
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-zinc-300 hover:border-indigo-400'
                        }`}
                      >
                        {item.done && <Check size={12} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <span className={item.done ? 'text-zinc-400 line-through' : 'text-zinc-700'}>
                          {item.label}
                        </span>
                        {taskTitle && (
                          <span className="ml-2 text-[10px] text-indigo-500">
                            → {taskTitle}
                          </span>
                        )}
                      </div>
                    </label>
                  )
                })}
              </div>

              <div className="mt-3 text-[11px] text-zinc-400">
                Criada por {goal.createdBy} em {goal.createdAt}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
