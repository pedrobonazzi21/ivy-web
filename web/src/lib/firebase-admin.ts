import admin from 'firebase-admin'

if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'ivy-auth-6d981' })
}

export const auth = admin.auth()
