import { useEffect, useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { auth, db } from '../lib/firebase'
import { addDoc, collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { LogOut, PlusCircle, Hash } from 'lucide-react'

const dice = (seed) => `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seed || 'user')}`

export default function Sidebar() {
  const navigate = useNavigate()
  const [me, setMe] = useState(auth.currentUser)
  const [channels, setChannels] = useState([])
  const [users, setUsers] = useState([])
  const [dmUid, setDmUid] = useState('')

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(setMe)
    const q = query(collection(db, 'channels'), orderBy('name'))
    const unsubChan = onSnapshot(q, (snap) => {
      setChannels(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return () => { unsubAuth(); unsubChan(); unsubUsers() }
  }, [])

  const peers = useMemo(() => users.filter((u) => u.id !== me?.uid), [users, me])

  const createChannel = async () => {
    const name = prompt('New channel name? (e.g., general)')?.trim()
    if (!name) return
    const docRef = await addDoc(collection(db, 'channels'), {
      name,
      createdAt: new Date(),
    })
    navigate(`/c/${docRef.id}`)
  }

  const openDM = () => {
    if (dmUid.trim()) navigate(`/dm/${dmUid.trim()}`)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
        <div className="font-semibold">Slack Clone</div>
        <button
          className="text-sm opacity-80 hover:opacity-100"
          onClick={() => auth.signOut()}
          title="Sign out"
        >
          <LogOut className="inline-block w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-3 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <img
            src={me?.photoURL || dice(me?.uid)}
            referrerPolicy="no-referrer"
            alt="me"
            className="w-8 h-8 rounded"
          />
          <div className="text-sm">
            <div className="font-medium">Signed in as</div>
            <div className="opacity-80">{me?.displayName || 'User'}</div>
            <div className="opacity-50 text-[11px] truncate">My UID: {me?.uid}</div>
          </div>
        </div>
      </div>

      <div className="px-3 py-2 border-b border-neutral-800 flex items-center justify-between">
        <div className="text-sm font-semibold">Channels</div>
        <button className="text-sm flex items-center gap-1 opacity-80 hover:opacity-100" onClick={createChannel}>
          <PlusCircle className="w-4 h-4" /> New
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        <NavLink
          to="/c/general"
          className={({ isActive }) => `flex items-center gap-2 px-3 py-1.5 rounded text-sm ${isActive ? 'bg-neutral-800' : 'opacity-90 hover:opacity-100'}`}
        >
          <Hash className="w-4 h-4" /> general
        </NavLink>
        {channels.map((ch) => (
          <NavLink
            key={ch.id}
            to={`/c/${ch.id}`}
            className={({ isActive }) => `flex items-center gap-2 px-3 py-1.5 rounded text-sm ${isActive ? 'bg-neutral-800' : 'opacity-90 hover:opacity-100'}`}
            title={ch.name}
          >
            <Hash className="w-4 h-4" /> {ch.name}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-2 border-t border-neutral-800 text-sm font-semibold">Direct Messages</div>
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {peers.map((u) => (
          <NavLink
            key={u.id}
            to={`/dm/${u.id}`}
            className={({ isActive }) => `flex items-center gap-2 px-3 py-1.5 rounded text-sm ${isActive ? 'bg-neutral-800' : 'opacity-90 hover:opacity-100'}`}
            title={u.displayName || u.id}
          >
            <img src={u.photoURL || dice(u.id)} referrerPolicy="no-referrer" alt="" className="w-5 h-5 rounded" />
            <span className="truncate">{u.displayName || u.id}</span>
          </NavLink>
        ))}
      </div>

      <div className="px-3 py-3 border-t border-neutral-800">
        <div className="text-xs opacity-70 mb-1">Open DM by UID</div>
        <div className="flex gap-2">
          <input
            value={dmUid}
            onChange={(e) => setDmUid(e.target.value)}
            placeholder="Peer UID…"
            className="flex-1 rounded bg-neutral-800/70 text-white text-sm px-2 py-1 outline-none"
          />
          <button onClick={openDM} className="text-sm px-2 py-1 rounded bg-neutral-700 hover:bg-neutral-600">
            Go
          </button>
        </div>
      </div>
    </div>
  )
}
