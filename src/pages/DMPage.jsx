import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { auth, db } from '../lib/firebase'
import { doc, onSnapshot } from 'firebase/firestore'
import MessageList from '../components/MessageList'
import MessageInput from '../components/MessageInput'

const dice = (seed) => `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seed || 'user')}`

export default function DMPage() {
  const { uid } = useParams()
  const me = auth.currentUser
  const pairId = useMemo(() => {
    const ids = [me?.uid || '', uid || ''].sort()
    return ids.join('_')
  }, [me?.uid, uid])
  const scopePath = `dms/${pairId}/messages`

  const [peer, setPeer] = useState(null)
  useEffect(() => {
    if (!uid) return
    const unsub = onSnapshot(doc(db, 'users', uid), (snap) => {
      setPeer(snap.exists() ? { id: snap.id, ...snap.data() } : null)
    })
    return () => unsub()
  }, [uid])

  return (
    <div className="flex-1 flex flex-col h-full">
      <header className="border-b border-neutral-200 bg-white px-4 py-3 flex items-center gap-2">
        <img src={peer?.photoURL || dice(uid)} referrerPolicy="no-referrer" alt="" className="w-6 h-6 rounded" />
        <div className="font-semibold">{peer?.displayName || uid}</div>
      </header>
      <MessageList scopePath={scopePath} />
      <MessageInput scopePath={scopePath} />
    </div>
  )
}
