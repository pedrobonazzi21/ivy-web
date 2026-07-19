import type { Role, Permission, PageAccess } from './types'
import { ROLE_PERMISSIONS, PAGE_ACCESS } from './types'

export function hasPermission(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) return false
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function can(role: Role | null | undefined, permission: Permission): boolean {
  return hasPermission(role, permission)
}

export function getPageAccess(role: Role, path: string): PageAccess {
  const match = Object.entries(PAGE_ACCESS).find(([key]) => path.startsWith(key))
  if (!match) return 'full'
  const access = match[1]
  if (role === 'admin') return 'full'
  return access[role] ?? 'full'
}

export function isPageBlocked(role: Role, path: string): boolean {
  return getPageAccess(role, path) === 'blocked'
}

export function isPageReadOnly(role: Role, path: string): boolean {
  return getPageAccess(role, path) === 'read_only'
}
