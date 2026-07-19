import prisma from './prisma'
import type { ProjectStats, Activity, Task, Component, TeamMember, TaskStatus, DiaryEntry, TestRecord, FileVersion, Comment, CalendarEvent, FebraceData, Role, Goal, GoalItem, ChecklistItem, Notification, UserSettings } from './types'
import { FEBRACE_CHECKLIST_ITEMS } from './types'

export type FileEntry = {
  id: string
  name: string
  category: 'documentos' | 'cad' | 'codigo' | 'fotos' | 'videos'
  size: number
  uploadedBy: string
  uploadedAt: string
  url: string
}

export type TeamCode = {
  code: string
  projectName: string
  used: boolean
}

function parseJSON<T>(val: string): T {
  try { return JSON.parse(val) as T } catch { return [] as unknown as T }
}

function now() {
  return new Date().toLocaleString('pt-BR')
}

// === Stats ===
const PRIORITY_WEIGHT: Record<string, number> = { alta: 3, media: 2, baixa: 1 }

function calcProgressFromTasks(tasks: { status: string; priority: string }[]): number {
  if (tasks.length === 0) return 0
  const totalWeight = tasks.reduce((s, t) => s + (PRIORITY_WEIGHT[t.priority] ?? 1), 0)
  const doneWeight = tasks
    .filter(t => t.status === 'concluido')
    .reduce((s, t) => s + (PRIORITY_WEIGHT[t.priority] ?? 1), 0)
  return Math.round((doneWeight / totalWeight) * 100)
}

export async function getStats(): Promise<ProjectStats> {
  const [tasks, components, files, tests, members, statsRow] = await Promise.all([
    prisma.task.findMany(),
    prisma.component.findMany(),
    prisma.fileEntry.findMany(),
    prisma.testRecord.findMany(),
    prisma.teamMember.findMany(),
    prisma.stats.findUnique({ where: { id: 'singleton' } }),
  ])

  const autoProgress = calcProgressFromTasks(tasks)

  return {
    progress: autoProgress,
    openTasks: tasks.filter(t => t.status !== 'concluido').length,
    totalComponents: components.length,
    totalFiles: files.length,
    totalTests: tests.length,
    totalMembers: members.length,
    lastUpdate: statsRow?.lastUpdate ?? now(),
  }
}

export async function updateStats(partial: Partial<ProjectStats>): Promise<ProjectStats> {
  const data: Record<string, unknown> = { ...partial, lastUpdate: now() }
  await prisma.stats.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', progress: 0, totalTests: 0, lastUpdate: now(), ...data },
    update: data,
  })
  return getStats()
}

// === Activities ===
export async function getActivities(): Promise<Activity[]> {
  const rows = await prisma.activity.findMany({ orderBy: { timestamp: 'desc' } })
  return rows as Activity[]
}

export async function getActivitiesPaginated(page: number, pageSize: number) {
  const [rows, total] = await Promise.all([
    prisma.activity.findMany({
      orderBy: { timestamp: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.activity.count(),
  ])
  return { activities: rows as Activity[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

export async function addActivity(user: string, action: string, target: string): Promise<Activity> {
  const row = await prisma.activity.create({
    data: { id: crypto.randomUUID(), user, action, target, timestamp: now() },
  })
  return row as Activity
}

export async function updateActivity(id: string, data: { action?: string; target?: string }): Promise<Activity | null> {
  try {
    const row = await prisma.activity.update({ where: { id }, data })
    return row as Activity
  } catch { return null }
}

export async function deleteActivity(id: string): Promise<boolean> {
  try {
    await prisma.activity.delete({ where: { id } })
    return true
  } catch { return false }
}

// === Files ===
export async function getFiles(): Promise<FileEntry[]> {
  const rows = await prisma.fileEntry.findMany({ orderBy: { uploadedAt: 'desc' } })
  return rows as FileEntry[]
}

export async function addFile(file: FileEntry): Promise<FileEntry> {
  const row = await prisma.fileEntry.create({ data: file })
  return row as FileEntry
}

export async function deleteFile(id: string): Promise<void> {
  await prisma.fileVersion.deleteMany({ where: { fileId: id } })
  await prisma.fileEntry.delete({ where: { id } })
}

// === Tasks ===
export async function getTasks(): Promise<Task[]> {
  const rows = await prisma.task.findMany({ orderBy: { createdAt: 'desc' } })
  return rows.map(r => ({
    ...r,
    comments: parseJSON<{ id: string; author: string; text: string; createdAt: string }[]>(r.comments),
    attachments: parseJSON<{ id: string; name: string; url: string }[]>(r.attachments),
  })) as Task[]
}

export async function getTasksByStatus(status: TaskStatus): Promise<Task[]> {
  const all = await getTasks()
  return all.filter(t => t.status === status)
}

export async function addTask(task: Task): Promise<Task> {
  const row = await prisma.task.create({
    data: {
      ...task,
      comments: JSON.stringify(task.comments),
      attachments: JSON.stringify(task.attachments),
    },
  })
  return { ...task }
}

export async function updateTask(id: string, partial: Partial<Task>): Promise<Task | null> {
  const existing = await prisma.task.findUnique({ where: { id } })
  if (!existing) return null

  const data: Record<string, unknown> = { ...partial }
  if (partial.comments) data.comments = JSON.stringify(partial.comments)
  if (partial.attachments) data.attachments = JSON.stringify(partial.attachments)

  await prisma.task.update({ where: { id }, data })
  const rows = await getTasks()
  return rows.find(t => t.id === id) ?? null
}

export async function deleteTask(id: string): Promise<boolean> {
  try {
    await prisma.task.delete({ where: { id } })
    return true
  } catch { return false }
}

// === Components ===
export async function getComponents(): Promise<Component[]> {
  const rows = await prisma.component.findMany({ orderBy: { createdAt: 'desc' } })
  return rows as Component[]
}

export async function addComponent(comp: Component): Promise<Component> {
  await prisma.component.create({ data: comp })
  return comp
}

export async function updateComponent(id: string, partial: Partial<Component>): Promise<Component | null> {
  try {
    await prisma.component.update({ where: { id }, data: partial })
    const rows = await getComponents()
    return rows.find(c => c.id === id) ?? null
  } catch { return null }
}

export async function deleteComponent(id: string): Promise<boolean> {
  try {
    await prisma.component.delete({ where: { id } })
    return true
  } catch { return false }
}

// === Team ===
export async function getTeamMembers(): Promise<TeamMember[]> {
  const rows = await prisma.teamMember.findMany()
  return rows as TeamMember[]
}

export async function addTeamMember(member: TeamMember): Promise<TeamMember> {
  await prisma.teamMember.create({ data: member })
  return member
}

export async function updateTeamMember(id: string, partial: Partial<TeamMember>): Promise<TeamMember | null> {
  try {
    await prisma.teamMember.update({ where: { id }, data: partial })
    const rows = await getTeamMembers()
    return rows.find(m => m.id === id) ?? null
  } catch { return null }
}

export async function removeTeamMember(id: string): Promise<boolean> {
  try {
    await prisma.teamMember.delete({ where: { id } })
    return true
  } catch { return false }
}

// === Team Codes ===
export async function validateTeamCode(code: string): Promise<TeamCode | null> {
  const entry = await prisma.teamCode.findUnique({ where: { code } })
  if (!entry || entry.used) return null
  await prisma.teamCode.update({ where: { code }, data: { used: true } })
  return entry as TeamCode
}

// === Diary ===
export async function getDiaryEntries(): Promise<DiaryEntry[]> {
  const rows = await prisma.diaryEntry.findMany({ orderBy: { date: 'desc' } })
  return rows.map(r => ({
    ...r,
    attachments: parseJSON<{ id: string; name: string; type: string; url: string }[]>(r.attachments),
  })) as DiaryEntry[]
}

export async function addDiaryEntry(entry: DiaryEntry): Promise<DiaryEntry> {
  await prisma.diaryEntry.create({
    data: { ...entry, attachments: JSON.stringify(entry.attachments) },
  })
  return entry
}

export async function updateDiaryEntry(id: string, partial: Partial<DiaryEntry>): Promise<DiaryEntry | null> {
  try {
    const data: Record<string, unknown> = { ...partial }
    if (partial.attachments) data.attachments = JSON.stringify(partial.attachments)
    await prisma.diaryEntry.update({ where: { id }, data })
    const rows = await getDiaryEntries()
    return rows.find(e => e.id === id) ?? null
  } catch { return null }
}

export async function deleteDiaryEntry(id: string): Promise<boolean> {
  try {
    await prisma.diaryEntry.delete({ where: { id } })
    return true
  } catch { return false }
}

// === Tests ===
export async function getTestRecords(): Promise<TestRecord[]> {
  const rows = await prisma.testRecord.findMany({ orderBy: { createdAt: 'desc' } })
  return rows.map(r => ({
    ...r,
    attachments: parseJSON<{ id: string; name: string; type: string; url: string }[]>(r.attachments),
  })) as TestRecord[]
}

export async function addTestRecord(record: TestRecord): Promise<TestRecord> {
  await prisma.testRecord.create({
    data: { ...record, attachments: JSON.stringify(record.attachments) },
  })
  return record
}

export async function updateTestRecord(id: string, partial: Partial<TestRecord>): Promise<TestRecord | null> {
  try {
    const data: Record<string, unknown> = { ...partial }
    if (partial.attachments) data.attachments = JSON.stringify(partial.attachments)
    await prisma.testRecord.update({ where: { id }, data })
    const rows = await getTestRecords()
    return rows.find(r => r.id === id) ?? null
  } catch { return null }
}

export async function deleteTestRecord(id: string): Promise<boolean> {
  try {
    await prisma.testRecord.delete({ where: { id } })
    return true
  } catch { return false }
}

// === File Versions ===
export async function getFileVersions(fileId?: string): Promise<FileVersion[]> {
  const where = fileId ? { fileId } : {}
  const rows = await prisma.fileVersion.findMany({ where, orderBy: { version: 'desc' } })
  return rows as FileVersion[]
}

export async function addFileVersion(version: FileVersion): Promise<FileVersion> {
  await prisma.fileVersion.create({ data: version })
  return version
}

// === Comments ===
export async function getComments(entityType: string, entityId: string): Promise<Comment[]> {
  const rows = await prisma.comment.findMany({
    where: { entityType, entityId },
    orderBy: { createdAt: 'asc' },
  })
  return rows as Comment[]
}

export async function addComment(comment: Comment): Promise<Comment> {
  await prisma.comment.create({ data: comment })
  return comment
}

// === Calendar ===
export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const rows = await prisma.calendarEvent.findMany()
  return rows as CalendarEvent[]
}

export async function addCalendarEvent(event: CalendarEvent): Promise<CalendarEvent> {
  await prisma.calendarEvent.create({ data: event })
  return event
}

export async function deleteCalendarEvent(id: string): Promise<boolean> {
  try {
    await prisma.calendarEvent.delete({ where: { id } })
    return true
  } catch { return false }
}

// === FEBRACE ===
export async function getFebraceData(): Promise<FebraceData> {
  const [stats, tasks, components, tests, diary, activities, teamMembers, events] = await Promise.all([
    getStats(),
    getTasks(),
    getComponents(),
    getTestRecords(),
    getDiaryEntries(),
    getActivities(),
    getTeamMembers(),
    getCalendarEvents(),
  ])

  const files = await getFiles()
  const photos = files
    .filter(f => f.category === 'fotos')
    .map(f => ({ name: f.name, url: f.url }))

  const diaryPhotos = diary
    .flatMap(e => e.attachments.filter(a => a.type === 'foto'))
    .map(a => ({ name: a.name, url: a.url }))

  return {
    stats,
    tasks,
    components,
    tests,
    diary,
    activities,
    photos: [...photos, ...diaryPhotos],
    teamMembers,
    events,
  }
}

// === Goals (Metas) ===
export async function getGoals(): Promise<Goal[]> {
  const rows = await prisma.goal.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  })
  return rows as Goal[]
}

export async function addGoal(goal: Goal): Promise<Goal> {
  await prisma.goal.create({
    data: {
      id: goal.id,
      title: goal.title,
      description: goal.description,
      status: goal.status,
      deadline: goal.deadline,
      progress: goal.progress,
      createdAt: goal.createdAt,
      createdBy: goal.createdBy,
      items: {
        create: goal.items.map(i => ({ id: i.id, label: i.label, taskId: i.taskId, done: i.done })),
      },
    },
  })
  return goal
}

export async function updateGoal(id: string, data: Partial<Goal>): Promise<Goal | null> {
  try {
    const { items, ...goalData } = data
    if (Object.keys(goalData).length > 0) {
      await prisma.goal.update({ where: { id }, data: goalData as Record<string, unknown> })
    }
    if (items) {
      await prisma.goalItem.deleteMany({ where: { goalId: id } })
      await prisma.goalItem.createMany({
        data: items.map(i => ({ id: i.id, goalId: id, label: i.label, taskId: i.taskId, done: i.done })),
      })
    }
    const goals = await getGoals()
    return goals.find(g => g.id === id) ?? null
  } catch { return null }
}

export async function updateGoalItem(itemId: string, done: boolean): Promise<boolean> {
  try {
    await prisma.goalItem.update({ where: { id: itemId }, data: { done } })
    return true
  } catch { return false }
}

export async function deleteGoal(id: string): Promise<boolean> {
  try {
    await prisma.goalItem.deleteMany({ where: { goalId: id } })
    await prisma.goal.delete({ where: { id } })
    return true
  } catch { return false }
}

// === FEBRACE Checklist ===
export async function getChecklistItems(): Promise<ChecklistItem[]> {
  const rows = await prisma.checklistItem.findMany()
  return rows as ChecklistItem[]
}

export async function seedChecklistIfEmpty(): Promise<void> {
  const count = await prisma.checklistItem.count()
  if (count > 0) return

  const items = FEBRACE_CHECKLIST_ITEMS.map(item => ({
    id: crypto.randomUUID(),
    ...item,
    done: false,
    responsible: '',
    notes: '',
    updatedAt: '',
    updatedBy: '',
  }))
  for (const item of items) {
    await prisma.checklistItem.create({ data: item })
  }
}

export async function addChecklistItem(item: ChecklistItem): Promise<ChecklistItem> {
  const row = await prisma.checklistItem.create({ data: item })
  return row as ChecklistItem
}

export async function updateChecklistItem(id: string, done: boolean, updatedBy: string): Promise<boolean> {
  try {
    await prisma.checklistItem.update({
      where: { id },
      data: { done, updatedAt: now(), updatedBy },
    })
    return true
  } catch { return false }
}

export async function updateChecklistItemDetails(id: string, data: { label?: string; category?: string; responsible?: string; notes?: string }): Promise<boolean> {
  try {
    await prisma.checklistItem.update({ where: { id }, data })
    return true
  } catch { return false }
}

export async function deleteChecklistItem(id: string): Promise<boolean> {
  try {
    await prisma.checklistItem.delete({ where: { id } })
    return true
  } catch { return false }
}

// === Notifications ===
export async function getNotifications(userId: string): Promise<Notification[]> {
  const rows = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return rows as Notification[]
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, read: false } })
}

export async function addNotification(notif: Notification): Promise<Notification> {
  const row = await prisma.notification.create({ data: notif })
  return row as Notification
}

export async function markNotificationRead(id: string): Promise<void> {
  await prisma.notification.update({ where: { id }, data: { read: true } })
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } })
}

export async function createNotificationForUser(userId: string, type: string, title: string, message: string, link: string = '') {
  const notif: Notification = {
    id: crypto.randomUUID(),
    userId,
    type,
    title,
    message,
    link,
    read: false,
    createdAt: now(),
  }
  await addNotification(notif)
}

// === User Settings ===
export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  try {
    const row = await prisma.userSettings.findUnique({ where: { userId } })
    return row as UserSettings | null
  } catch { return null }
}

export async function upsertUserSettings(settings: UserSettings): Promise<UserSettings> {
  const row = await prisma.userSettings.upsert({
    where: { userId: settings.userId },
    create: settings,
    update: settings,
  })
  return row as UserSettings
}

export const CATEGORIES = [
  { value: 'documentos', label: 'Documentos', icon: 'FileText' },
  { value: 'cad', label: 'CAD', icon: 'Box' },
  { value: 'codigo', label: 'Código', icon: 'Code' },
  { value: 'fotos', label: 'Fotos', icon: 'Image' },
  { value: 'videos', label: 'Vídeos', icon: 'Video' },
] as const
