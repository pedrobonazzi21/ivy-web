import prisma from './prisma'
import type { GoogleToken, GoogleDriveLink } from '@prisma/client'

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!

export function getAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

async function exchangeCode(code: string) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) throw new Error('Falha na troca do código')
  return res.json()
}

async function refreshAccessToken(refreshToken: string) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) throw new Error('Falha ao renovar token')
  return res.json()
}

export async function getValidToken(): Promise<string | null> {
  const token = await prisma.googleToken.findUnique({ where: { id: 'singleton' } })
  if (!token) return null

  const expiry = new Date(token.expiryDate).getTime()
  if (Date.now() < expiry - 60000) return token.accessToken

  try {
    const data = await refreshAccessToken(token.refreshToken)
    const newExpiry = new Date(Date.now() + data.expires_in * 1000).toISOString()
    await prisma.googleToken.update({
      where: { id: 'singleton' },
      data: { accessToken: data.access_token, expiryDate: newExpiry },
    })
    return data.access_token
  } catch {
    await prisma.googleToken.delete({ where: { id: 'singleton' } })
    return null
  }
}

export async function handleCallback(code: string) {
  const data = await exchangeCode(code)
  await prisma.googleToken.upsert({
    where: { id: 'singleton' },
    create: {
      id: 'singleton',
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiryDate: new Date(Date.now() + data.expires_in * 1000).toISOString(),
      scope: data.scope,
      tokenType: data.token_type,
    },
    update: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? undefined,
      expiryDate: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    },
  })
}

export async function disconnectGoogle() {
  const token = await prisma.googleToken.findUnique({ where: { id: 'singleton' } })
  if (token) {
    await fetch('https://oauth2.googleapis.com/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ token: token.accessToken }),
    }).catch(() => {})
    await prisma.googleToken.delete({ where: { id: 'singleton' } })
  }
  await prisma.googleDriveLink.deleteMany()
}

export type GoogleDriveFile = {
  id: string
  name: string
  mimeType: string
  modifiedTime: string
  webViewLink: string
  iconLink: string
  size?: string
}

export async function listDriveFiles(query?: string): Promise<GoogleDriveFile[]> {
  const q = query || "trashed = false and (mimeType contains 'application/vnd.google-apps' or mimeType contains 'image/' or mimeType = 'application/pdf')"
  const token = await getValidToken()
  if (!token) return []

  const params = new URLSearchParams({
    q,
    fields: 'files(id,name,mimeType,modifiedTime,webViewLink,iconLink,size)',
    orderBy: 'modifiedTime desc',
    pageSize: '50',
  })

  const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    if (res.status === 401) {
      await prisma.googleToken.delete({ where: { id: 'singleton' } })
    }
    return []
  }

  const data = await res.json()
  return data.files || []
}

export async function exportDocContent(fileId: string, mimeType: string): Promise<string> {
  const token = await getValidToken()
  if (!token) return ''

  if (mimeType.includes('google-apps')) {
    const exportMime = mimeType.includes('document')
      ? 'text/html'
      : mimeType.includes('spreadsheet')
        ? 'text/csv'
        : 'text/plain'
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent(exportMime)}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    if (!res.ok) return ''
    return res.text()
  }

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (!res.ok) return ''
  const buf = await res.arrayBuffer()
  return Buffer.from(buf).toString('base64')
}

export async function syncLinkedDoc(link: GoogleDriveLink): Promise<string> {
  const token = await getValidToken()
  if (!token) return link.content

  const metaRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${link.fileId}?fields=modifiedTime`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (!metaRes.ok) return link.content

  const meta = await metaRes.json()
  if (meta.modifiedTime === link.lastModifiedAt) return link.content

  const content = await exportDocContent(link.fileId, link.mimeType)
  const now = new Date().toLocaleString('pt-BR')

  await prisma.googleDriveLink.update({
    where: { id: link.id },
    data: { content, lastSyncedAt: now, lastModifiedAt: meta.modifiedTime },
  })

  return content
}

export async function getLinkedDocs() {
  return prisma.googleDriveLink.findMany({ orderBy: { linkedAt: 'desc' } })
}
