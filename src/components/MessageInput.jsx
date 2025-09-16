import { useState } from 'react'
import { auth, db, ts } from '../lib/firebase'
import { addDoc, collection, doc, setDoc } from 'firebase/firestore'

export default function MessageInput({ scopePath }) {
  const [text, setText] = useState('')
  const me = auth.currentUser

  const segs = scopePath?.split('/').filter(Boolean) || []
  const ref = segs.length ? collection(db, ...segs) : null

  const send = async () => {
    const t = text.trim()
    if (!t || !ref || !me) return
    await addDoc(ref, {
      type: 'text',
      text: t,
      senderId: me.uid,
      senderName: me.displayName || 'User',
      senderPhoto: me.photoURL || '',
      createdAt: ts(),
    })
    setText('')
  }

  const onKeyDown = async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      await send()
    }
  }

  const markTyping = async () => {
    if (!me) return
    try {
      await setDoc(
        doc(db, 'typing', me.uid),
        { scope: scopePath, name: me.displayName || 'User', until: new Date(Date.now() + 3000) },
        { merge: true }
      )
    } catch {}
  }

  return (
    <div className="border-t border-neutral-200 bg-white p-3">
      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); markTyping() }}
        onKeyDown={onKeyDown}
        placeholder="Type a message… (Enter to send / Shift+Enter for newline)"
        className="w-full min-h-[64px] max-h-[200px] rounded-lg border border-neutral-300 p-3 outline-none focus:ring focus:ring-neutral-200"
      />
      <div className="mt-2 flex justify-end">
        <button
          onClick={send}
          className="px-3 py-1.5 rounded bg-neutral-900 text-white text-sm hover:opacity-90"
        >
          Send
        </button>
      </div>
    </div>
  )
}
