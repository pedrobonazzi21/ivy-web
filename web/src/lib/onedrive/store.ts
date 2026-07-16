export type OneDriveItem = {
  id: string
  name: string
  path: string
  type: 'file' | 'folder'
  mimeType?: string
  size?: number
  lastModifiedBy?: string
  lastModifiedAt?: string
  webUrl?: string
  downloadUrl?: string
  fileVersion?: string
}

export type OneDriveVersion = {
  id: string
  version: number
  lastModifiedBy: string
  lastModifiedAt: string
  size: number
}

const NOW = new Date().toLocaleString('pt-BR')

const FOLDER_STRUCTURE: Record<string, OneDriveItem[]> = {
  '/': [
    { id: 'od-root-doc', name: 'Documentos', path: '/Documentos', type: 'folder' },
    { id: 'od-root-cad', name: 'CAD', path: '/CAD', type: 'folder' },
    { id: 'od-root-cod', name: 'Código', path: '/Código', type: 'folder' },
    { id: 'od-root-rel', name: 'Relatórios', path: '/Relatórios', type: 'folder' },
    { id: 'od-root-foto', name: 'Fotos', path: '/Fotos', type: 'folder' },
    { id: 'od-root-video', name: 'Vídeos', path: '/Vídeos', type: 'folder' },
    { id: 'od-root-apres', name: 'Apresentações', path: '/Apresentações', type: 'folder' },
  ],
  '/Documentos': [
    { id: 'od-doc-1', name: 'datasheet_esp32.pdf', path: '/Documentos/datasheet_esp32.pdf', type: 'file', mimeType: 'application/pdf', size: 2450000, lastModifiedBy: 'João', lastModifiedAt: '15/07/2026 14:30:00', webUrl: '#', downloadUrl: '#', fileVersion: '2' },
    { id: 'od-doc-2', name: 'esquema_eletrico.pdf', path: '/Documentos/esquema_eletrico.pdf', type: 'file', mimeType: 'application/pdf', size: 1800000, lastModifiedBy: 'Maria', lastModifiedAt: '14/07/2026 10:15:00', webUrl: '#', downloadUrl: '#', fileVersion: '4' },
    { id: 'od-doc-3', name: 'cronograma.docx', path: '/Documentos/cronograma.docx', type: 'file', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 520000, lastModifiedBy: 'Pedro', lastModifiedAt: '13/07/2026 16:45:00', webUrl: '#', downloadUrl: '#', fileVersion: '3' },
  ],
  '/CAD': [
    { id: 'od-cad-1', name: 'chassi_v3.step', path: '/CAD/chassi_v3.step', type: 'file', mimeType: 'application/step', size: 8500000, lastModifiedBy: 'Pedro', lastModifiedAt: '15/07/2026 09:00:00', webUrl: '#', downloadUrl: '#', fileVersion: '3' },
    { id: 'od-cad-2', name: 'garra_v5.step', path: '/CAD/garra_v5.step', type: 'file', mimeType: 'application/step', size: 3200000, lastModifiedBy: 'Pedro', lastModifiedAt: '14/07/2026 11:30:00', webUrl: '#', downloadUrl: '#', fileVersion: '5' },
    { id: 'od-cad-3', name: 'base_rodas.step', path: '/CAD/base_rodas.step', type: 'file', mimeType: 'application/step', size: 4100000, lastModifiedBy: 'João', lastModifiedAt: '12/07/2026 15:20:00', webUrl: '#', downloadUrl: '#', fileVersion: '2' },
  ],
  '/Código': [
    { id: 'od-cod-1', name: 'firmware_v2.cpp', path: '/Código/firmware_v2.cpp', type: 'file', mimeType: 'text/plain', size: 45000, lastModifiedBy: 'Maria', lastModifiedAt: '15/07/2026 08:00:00', webUrl: '#', downloadUrl: '#', fileVersion: '2' },
    { id: 'od-cod-2', name: 'controle_pid.py', path: '/Código/controle_pid.py', type: 'file', mimeType: 'text/plain', size: 12000, lastModifiedBy: 'Maria', lastModifiedAt: '14/07/2026 17:00:00', webUrl: '#', downloadUrl: '#', fileVersion: '1' },
  ],
  '/Relatórios': [
    { id: 'od-rel-1', name: 'relatorio_parcial.docx', path: '/Relatórios/relatorio_parcial.docx', type: 'file', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 2800000, lastModifiedBy: 'João', lastModifiedAt: '15/07/2026 12:00:00', webUrl: '#', downloadUrl: '#', fileVersion: '6' },
  ],
  '/Fotos': [
    { id: 'od-foto-1', name: 'prototipo_frente.jpg', path: '/Fotos/prototipo_frente.jpg', type: 'file', mimeType: 'image/jpeg', size: 3200000, lastModifiedBy: 'Pedro', lastModifiedAt: '14/07/2026 14:00:00', webUrl: '#', downloadUrl: '#', fileVersion: '1' },
    { id: 'od-foto-2', name: 'montagem_tras.jpg', path: '/Fotos/montagem_tras.jpg', type: 'file', mimeType: 'image/jpeg', size: 2800000, lastModifiedBy: 'Pedro', lastModifiedAt: '14/07/2026 14:05:00', webUrl: '#', downloadUrl: '#', fileVersion: '1' },
  ],
  '/Vídeos': [
    { id: 'od-vid-1', name: 'teste_motores.mp4', path: '/Vídeos/teste_motores.mp4', type: 'file', mimeType: 'video/mp4', size: 45000000, lastModifiedBy: 'João', lastModifiedAt: '14/07/2026 16:30:00', webUrl: '#', downloadUrl: '#', fileVersion: '1' },
  ],
  '/Apresentações': [
    { id: 'od-apres-1', name: 'apresentacao_febrace.pptx', path: '/Apresentações/apresentacao_febrace.pptx', type: 'file', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', size: 12000000, lastModifiedBy: 'Maria', lastModifiedAt: '15/07/2026 10:00:00', webUrl: '#', downloadUrl: '#', fileVersion: '5' },
  ],
}

const VERSIONS: Record<string, OneDriveVersion[]> = {
  'od-doc-1': [
    { id: 'v-doc-1-1', version: 1, lastModifiedBy: 'João', lastModifiedAt: '10/07/2026 09:00:00', size: 2400000 },
    { id: 'v-doc-1-2', version: 2, lastModifiedBy: 'João', lastModifiedAt: '15/07/2026 14:30:00', size: 2450000 },
  ],
  'od-cad-2': [
    { id: 'v-cad-2-1', version: 1, lastModifiedBy: 'Pedro', lastModifiedAt: '05/07/2026 10:00:00', size: 2800000 },
    { id: 'v-cad-2-2', version: 2, lastModifiedBy: 'Pedro', lastModifiedAt: '08/07/2026 14:00:00', size: 3000000 },
    { id: 'v-cad-2-3', version: 3, lastModifiedBy: 'Pedro', lastModifiedAt: '10/07/2026 11:00:00', size: 3100000 },
    { id: 'v-cad-2-4', version: 4, lastModifiedBy: 'Pedro', lastModifiedAt: '12/07/2026 16:00:00', size: 3150000 },
    { id: 'v-cad-2-5', version: 5, lastModifiedBy: 'Pedro', lastModifiedAt: '14/07/2026 11:30:00', size: 3200000 },
  ],
  'od-rel-1': [
    { id: 'v-rel-1-1', version: 1, lastModifiedBy: 'João', lastModifiedAt: '01/07/2026 08:00:00', size: 1000000 },
    { id: 'v-rel-1-2', version: 2, lastModifiedBy: 'João', lastModifiedAt: '03/07/2026 10:00:00', size: 1500000 },
    { id: 'v-rel-1-3', version: 3, lastModifiedBy: 'João', lastModifiedAt: '06/07/2026 14:00:00', size: 2000000 },
    { id: 'v-rel-1-4', version: 4, lastModifiedBy: 'Maria', lastModifiedAt: '10/07/2026 09:00:00', size: 2400000 },
    { id: 'v-rel-1-5', version: 5, lastModifiedBy: 'Maria', lastModifiedAt: '12/07/2026 11:00:00', size: 2600000 },
    { id: 'v-rel-1-6', version: 6, lastModifiedBy: 'João', lastModifiedAt: '15/07/2026 12:00:00', size: 2800000 },
  ],
}

export function getOneDriveItems(folderPath: string): OneDriveItem[] {
  const items = FOLDER_STRUCTURE[folderPath]
  if (items) return [...items]
  return []
}

export function getOneDriveItem(fileId: string): OneDriveItem | null {
  for (const items of Object.values(FOLDER_STRUCTURE)) {
    const found = items.find(i => i.id === fileId)
    if (found) return { ...found }
  }
  return null
}

export function getOneDriveVersions(fileId: string): OneDriveVersion[] {
  const versions = VERSIONS[fileId]
  if (versions) return [...versions].reverse()
  return []
}

export const ONEDRIVE_ROOT_FOLDERS = [
  { path: '/Documentos', category: 'documentos' },
  { path: '/CAD', category: 'cad' },
  { path: '/Código', category: 'codigo' },
  { path: '/Fotos', category: 'fotos' },
  { path: '/Vídeos', category: 'videos' },
  { path: '/Relatórios', category: 'documentos' },
  { path: '/Apresentações', category: 'documentos' },
]
