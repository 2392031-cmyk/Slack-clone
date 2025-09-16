import { useEffect, useRef, useState } from 'react'
import { auth, db } from '../lib/firebase'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'

const dice = (seed) => `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seed || 'user')}`

function tsToDate(ts) {
  try {
    if (!ts) return null
    if (typeof ts.toDate === 'function') return ts.toDate()
    return new Date(ts)
  } catch {
    return null
  }
}

export default function MessageList({ scopePath }) {
  const [messages, setMessages] = useState([])
  const [typers, setTypers] = useState([])
  const bottomRef = useRef(null)
  const prevCount = useRef(0)
  const me = auth.currentUser

  useEffect(() => {
    if (!scopePath) return
    const segs = scopePath.split('/').filter(Boolean)
    const ref = collection(db, ...segs)
    const q = query(ref, orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setMessages(arr)
      // desktop notification
      if (document.hidden && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        if (arr.length > prevCount.current) {
          const last = arr[arr.length - 1]
          if (last && last.senderId && last.senderId !== me?.uid) {
            try { new Notification(last.senderName || 'New message', { body: last.text || '' }) } catch {}
          }
        }
      }
      prevCount.current = arr.length
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 0)
    })
    return () => unsub()
  }, [scopePath])

  useEffect(() => {
    // typing indicator
    const q = query(
      collection(db, 'typing'),
      where('scope', '==', scopePath),
      where('until', '>', new Date())
    )
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      const filtered = arr.filter((t) => t.id !== me?.uid)
      setTypers(filtered)
    })
    return () => unsub()
  }, [scopePath])

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.map((m) => {
        const mine = m.senderId === me?.uid
        const stamp = tsToDate(m.createdAt)
        return (
          <div key={m.id} className={`mb-3 flex items-start gap-3 ${mine ? 'justify-end' : ''}`}>
            {!mine && (
              <img src={m.senderPhoto || dice(m.senderId)} referrerPolicy="no-referrer" alt="" className="w-8 h-8 rounded" />
            )}
            <div className={`max-w-[70%] rounded-lg px-3 py-2 ${mine ? 'bg-neutral-800 text-white' : 'bg-white border border-neutral-200'}`}>
              <div className="text-xs opacity-60 mb-0.5">
                {m.senderName || 'User'} {stamp ? '· ' + stamp.toLocaleString() : ''}
              </div>
              <div className="whitespace-pre-wrap break-words text-sm">{m.text}</div>
            </div>
            {mine && (
              <img src={m.senderPhoto || dice(m.senderId)} referrerPolicy="no-referrer" alt="" className="w-8 h-8 rounded" />
            )}
          </div>
        )
      })}
      {typers.length > 0 && (
        <div className="text-xs opacity-70 my-2">
          {typers.map((t) => t.name || 'Someone').join(', ')} {typers.length > 1 ? 'are' : 'is'} typing…
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
