import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyD_zyX7Zanc0scjxdlaDk-xkJSt3pv4naQ',
  authDomain: 'ivy-auth-6d981.firebaseapp.com',
  databaseURL: 'https://ivy-auth-6d981-default-rtdb.firebaseio.com',
  projectId: 'ivy-auth-6d981',
  storageBucket: 'ivy-auth-6d981.firebasestorage.app',
  messagingSenderId: '377180324466',
  appId: '1:377180324466:web:1696e30328c9362b94f8eb',
  measurementId: 'G-TZ4FE056EP',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  return signInWithPopup(auth, provider)
}

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function signUpWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password)
}
