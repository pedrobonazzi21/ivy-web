import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'

const STORAGE_BUCKET = 'ivy-auth-6d981.firebasestorage.app'

function getServiceAccount() {
  const encoded = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!encoded) return null
  return JSON.parse(Buffer.from(encoded, 'base64').toString('utf-8'))
}

export function getBucket() {
  const existing = getApps().find(a => a.name === '[DEFAULT]')
  if (existing) return getStorage(existing).bucket(STORAGE_BUCKET)

  const account = getServiceAccount()
  if (!account) throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is required')

  const app = initializeApp({ credential: cert(account) })
  return getStorage(app).bucket(STORAGE_BUCKET)
}
