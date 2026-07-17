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

export function getOneDriveItems(_folderPath: string): OneDriveItem[] {
  return []
}

export function getOneDriveItem(_fileId: string): OneDriveItem | null {
  return null
}

export function getOneDriveVersions(_fileId: string): OneDriveVersion[] {
  return []
}

export const ONEDRIVE_ROOT_FOLDERS: { path: string; category: string }[] = []
