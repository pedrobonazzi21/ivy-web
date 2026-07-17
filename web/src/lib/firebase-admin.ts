import { getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

if (!getApps().length) {
  initializeApp({ projectId: 'ivy-auth-6d981' })
}

export const auth = getAuth()
