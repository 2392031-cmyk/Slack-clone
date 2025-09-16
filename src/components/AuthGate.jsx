import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth'
import { auth, google, db, ts } from '../lib/firebase'
import { doc, setDoc } from 'firebase/firestore'

export default function AuthGate({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        try {
          await setDoc(
            doc(db, 'users', u.uid),
            {
              displayName: u.displayName || 'User',
              photoURL: u.photoURL || '',
              email: u.email || '',
              updatedAt: ts(),
            },
            { merge: true }
          )
        } catch (e) {
          console.error('User upsert failed', e)
        }
        if (typeof Notification !== 'undefined') {
          const asked = localStorage.getItem('notifAsked')
          if (!asked) {
            Notification.requestPermission().finally(() => {
              localStorage.setItem('notifAsked', '1')
            })
          }
        }
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  if (loading) {
    return (
      <div className="h-screen w-screen grid place-items-center">
        <div className="text-lg">Loading…</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="h-screen w-screen grid place-items-center bg-neutral-100">
        <div className="w-[360px] rounded-xl border border-neutral-200 bg-white p-6 shadow">
          <h1 className="text-2xl font-semibold mb-2">Slack Clone</h1>
          <p className="text-sm text-neutral-600 mb-6">Sign in with Google to start.</p>
          <button
            className="w-full rounded-lg bg-neutral-900 text-white py-2.5 hover:opacity-90"
            onClick={() => signInWithPopup(auth, google)}
          >
            Sign in with Google
          </button>
        </div>
      </div>
    )
  }

  return children
}
