import { Routes, Route, Navigate } from 'react-router-dom'
import AuthGate from './components/AuthGate'
import Sidebar from './components/Sidebar'
import ChannelPage from './pages/ChannelPage'
import DMPage from './pages/DMPage'

export default function App() {
  return (
    <AuthGate>
      <div className="h-screen w-screen flex bg-neutral-100 text-neutral-900">
        <aside className="w-72 bg-neutral-900 text-neutral-100 hidden md:flex flex-col">
          <Sidebar />
        </aside>
        <main className="flex-1 flex flex-col">
          <div className="md:hidden p-3 bg-neutral-900 text-white text-sm">Use desktop width for sidebar</div>
          <div className="flex-1 flex flex-col h-full">
            <Routes>
              <Route path="/" element={<Navigate to="/c/general" replace />} />
              <Route path="/c/:channelId" element={<ChannelPage />} />
              <Route path="/dm/:uid" element={<DMPage />} />
              <Route path="*" element={<Navigate to="/c/general" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </AuthGate>
  )
}
