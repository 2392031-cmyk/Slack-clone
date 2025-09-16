import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore, serverTimestamp } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FB_SENDER,
  appId: import.meta.env.VITE_FB_APP_ID,
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const google = new GoogleAuthProvider()
export const db = getFirestore(app)
export const ts = serverTimestamp
