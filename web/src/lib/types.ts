export type Role = 'admin' | 'colaborador' | 'visitante'

export interface TeamMember {
  id: string
  name: string
  email: string
  role: Role
  avatar?: string
  invitedAt: string
}

export interface ProjectStats {
  progress: number
  openTasks: number
  totalComponents: number
  totalFiles: number
  totalTests: number
  totalMembers: number
  lastUpdate: string
}

export interface Activity {
  id: string
  user: string
  action: string
  target: string
  timestamp: string
}

export type TaskStatus = 'a_fazer' | 'em_andamento' | 'em_revisao' | 'concluido'
export type TaskPriority = 'baixa' | 'media' | 'alta'

export interface TaskComment {
  id: string
  author: string
  text: string
  createdAt: string
}

export interface TaskAttachment {
  id: string
  name: string
  url: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  responsible: string
  deadline: string
  comments: TaskComment[]
  attachments: TaskAttachment[]
  createdAt: string
  createdBy: string
}

export type ComponentStatus = 'instalado' | 'em_estoque' | 'em_compra' | 'defeituoso'

export interface Component {
  id: string
  name: string
  quantity: number
  available: number
  inUse: number
  supplier: string
  price: number
  status: ComponentStatus
  location: string
  datasheetUrl: string
  createdAt: string
  createdBy: string
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrador',
  colaborador: 'Colaborador',
  visitante: 'Visitante',
}

export type Permission =
  | 'visualizar'
  | 'comentar'
  | 'criar_tarefas'
  | 'editar_tarefas'
  | 'gerenciar_componentes'
  | 'gerenciar_arquivos'
  | 'gerenciar_diario'
  | 'gerenciar_testes'
  | 'gerenciar_metas'
  | 'gerenciar_checklist'
  | 'gerenciar_eventos'
  | 'gerenciar_equipe'
  | 'configurar_sistema'

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    'visualizar', 'comentar',
    'criar_tarefas', 'editar_tarefas',
    'gerenciar_componentes', 'gerenciar_arquivos',
    'gerenciar_diario', 'gerenciar_testes',
    'gerenciar_metas', 'gerenciar_checklist',
    'gerenciar_eventos', 'gerenciar_equipe',
    'configurar_sistema',
  ],
  colaborador: [
    'visualizar',
    'comentar',
  ],
  visitante: [
    'visualizar',
    'comentar',
  ],
}

export type PageAccess = 'full' | 'read_only' | 'blocked'

export const PAGE_ACCESS: Record<string, { colaborador: PageAccess; visitante: PageAccess }> = {
  '/projeto/tarefas':      { colaborador: 'read_only', visitante: 'blocked' },
  '/projeto/calendario':   { colaborador: 'read_only', visitante: 'blocked' },
  '/projeto/metas':        { colaborador: 'read_only', visitante: 'blocked' },
  '/projeto/checklist':    { colaborador: 'read_only', visitante: 'blocked' },
  '/projeto/componentes':  { colaborador: 'read_only', visitante: 'blocked' },
  '/projeto/arquivos':     { colaborador: 'read_only', visitante: 'blocked' },
  '/projeto/google':       { colaborador: 'read_only', visitante: 'blocked' },
  '/projeto/onedrive':     { colaborador: 'read_only', visitante: 'blocked' },
  '/projeto/diario':       { colaborador: 'read_only', visitante: 'blocked' },
  '/projeto/testes':       { colaborador: 'read_only', visitante: 'blocked' },
  '/projeto/febrace':      { colaborador: 'read_only', visitante: 'read_only' },
  '/projeto/exportar-pdf': { colaborador: 'read_only', visitante: 'blocked' },
  '/projeto/equipe':       { colaborador: 'read_only', visitante: 'read_only' },
  '/dashboard':            { colaborador: 'read_only', visitante: 'read_only' },
  '/configuracoes':        { colaborador: 'read_only', visitante: 'read_only' },
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  a_fazer: 'A Fazer',
  em_andamento: 'Em Andamento',
  em_revisao: 'Em Revisão',
  concluido: 'Concluído',
}

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
}

export const COMPONENT_STATUS_LABELS: Record<ComponentStatus, string> = {
  instalado: 'Instalado',
  em_estoque: 'Em Estoque',
  em_compra: 'Em Compra',
  defeituoso: 'Defeituoso',
}

// === Diary ===
export interface DiaryAttachment {
  id: string
  name: string
  type: 'foto' | 'video' | 'codigo' | 'documento'
  url: string
}

export interface DiaryEntry {
  id: string
  date: string
  content: string
  author: string
  attachments: DiaryAttachment[]
  createdAt: string
}

// === Tests ===
export interface TestAttachment {
  id: string
  name: string
  type: string
  url: string
}

export interface TestRecord {
  id: string
  name: string
  result: number
  problem: string
  solution: string
  attachments: TestAttachment[]
  createdBy: string
  createdAt: string
}

// === File Versions ===
export interface FileVersion {
  id: string
  fileId: string
  fileName: string
  version: number
  editedBy: string
  editedAt: string
  description: string
}

// === Comments (generic) ===
export interface Comment {
  id: string
  entityType: 'component' | 'file' | 'test' | 'diary'
  entityId: string
  author: string
  text: string
  createdAt: string
}

export const DIARY_ATTACHMENT_LABELS: Record<string, string> = {
  foto: 'Foto',
  video: 'Vídeo',
  codigo: 'Código',
  documento: 'Documento',
}

// === Calendar ===
export type CalendarEventType = 'tarefa' | 'teste' | 'reuniao' | 'apresentacao' | 'prazo' | 'competicao'

export interface CalendarEvent {
  id: string
  title: string
  date: string
  type: CalendarEventType
  description?: string
}

export const CALENDAR_EVENT_LABELS: Record<CalendarEventType, string> = {
  tarefa: 'Tarefa',
  teste: 'Teste',
  reuniao: 'Reunião',
  apresentacao: 'Apresentação',
  prazo: 'Prazo',
  competicao: 'Competição',
}

// === Goals (Metas) ===
export type GoalStatus = 'nao_iniciada' | 'em_andamento' | 'concluida'

export interface Goal {
  id: string
  title: string
  description: string
  status: GoalStatus
  deadline: string
  progress: number
  createdAt: string
  createdBy: string
  items: GoalItem[]
}

export interface GoalItem {
  id: string
  goalId: string
  label: string
  taskId: string
  done: boolean
}

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  nao_iniciada: 'Não Iniciada',
  em_andamento: 'Em Andamento',
  concluida: 'Concluída',
}

export const GOAL_STATUS_COLORS: Record<GoalStatus, string> = {
  nao_iniciada: 'text-zinc-400',
  em_andamento: 'text-sky-600',
  concluida: 'text-green-600',
}

export const GOAL_STATUS_BG: Record<GoalStatus, string> = {
  nao_iniciada: 'bg-zinc-100',
  em_andamento: 'bg-sky-50',
  concluida: 'bg-green-50',
}

// === FEBRACE Checklist ===
export interface ChecklistItem {
  id: string
  category: string
  label: string
  done: boolean
  responsible: string
  notes: string
  updatedAt: string
  updatedBy: string
}

export const CHECKLIST_CATEGORIES = [
  { value: 'cadastro', label: 'Cadastro' },
  { value: 'documentacao', label: 'Documentação' },
  { value: 'midia', label: 'Mídia' },
  { value: 'personalizado', label: 'Personalizado' },
] as const

export const CHECKLIST_CATEGORY_LABELS: Record<string, string> = {
  cadastro: 'Cadastro',
  documentacao: 'Documentação',
  midia: 'Mídia',
  personalizado: 'Personalizado',
}

export const FEBRACE_CHECKLIST_ITEMS: { category: string; label: string }[] = [
  { category: 'cadastro', label: 'Cadastro realizado' },
  { category: 'cadastro', label: 'Projeto criado' },
  { category: 'documentacao', label: 'Diário atualizado' },
  { category: 'documentacao', label: 'Banner enviado' },
  { category: 'midia', label: 'Vídeo enviado' },
  { category: 'documentacao', label: 'PDF enviado' },
  { category: 'midia', label: 'Fotos anexadas' },
  { category: 'documentacao', label: 'Formulário finalizado' },
]

export const CHECKLIST_CATEGORY_ORDER = ['cadastro', 'documentacao', 'midia', 'personalizado']

// === Notifications ===
export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  link: string
  read: boolean
  createdAt: string
}

// === User Settings ===
export interface UserSettings {
  userId: string
  notifyTaskAssigned: boolean
  notifyDeadline: boolean
  notifyChecklist: boolean
}

export const NOTIFICATION_TYPES = ['task_assigned', 'deadline', 'checklist', 'team', 'system'] as const

export const CALENDAR_EVENT_COLORS: Record<CalendarEventType, string> = {
  tarefa: 'bg-sky-500',
  teste: 'bg-amber-500',
  reuniao: 'bg-purple-500',
  apresentacao: 'bg-indigo-500',
  prazo: 'bg-red-500',
  competicao: 'bg-green-500',
}

// === FEBRACE ===
export interface FebraceData {
  stats: ProjectStats
  tasks: Task[]
  components: Component[]
  tests: TestRecord[]
  diary: DiaryEntry[]
  activities: Activity[]
  photos: { name: string; url: string }[]
  teamMembers: TeamMember[]
  events: CalendarEvent[]
}
