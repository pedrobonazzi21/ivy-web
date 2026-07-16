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

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin: [
    'Editar tudo',
    'Excluir',
    'Criar projetos',
    'Convidar pessoas',
    'Integrar OneDrive',
    'Aprovar tarefas',
    'Configurar o sistema',
  ],
  colaborador: [
    'Criar tarefas',
    'Comentar',
    'Anexar arquivos',
    'Cadastrar testes',
    'Adicionar componentes',
    'Atualizar diário',
  ],
  visitante: [
    'Visualizar',
    'Comentar',
    'Acompanhar evolução',
  ],
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
