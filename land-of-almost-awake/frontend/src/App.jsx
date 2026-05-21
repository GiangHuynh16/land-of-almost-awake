import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from './store/useAppStore.js'
import { useRealtimeSync } from './hooks/useRealtimeSync.js'
import { CinematicUnlock } from './components/CinematicUnlock.jsx'
import { FinalCompletion } from './components/FinalCompletion.jsx'
import WorldMap from './pages/WorldMap.jsx'
import KingdomDetail from './pages/KingdomDetail.jsx'
import Signup from './pages/auth/Signup.jsx'
import Join from './pages/auth/Join.jsx'
import Login from './pages/auth/Login.jsx'

function AuthGuard({ children }) {
  const token = useAppStore((s) => s.token)
  return token ? children : <Navigate to="/auth/login" replace />
}

export default function App() {
  const user = useAppStore((s) => s.user)
  const pendingUnlock = useAppStore((s) => s.pendingUnlock)
  const journeyComplete = useAppStore((s) => s.journeyComplete)

  useRealtimeSync(user?.workspace_id)

  return (
    <>
      <Routes>
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/auth/join" element={<Join />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/" element={<AuthGuard><WorldMap /></AuthGuard>} />
        <Route path="/kingdom/:id" element={<AuthGuard><KingdomDetail /></AuthGuard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {pendingUnlock && <CinematicUnlock kingdom={pendingUnlock.kingdom} catchUp={pendingUnlock.catchUp} />}
      {journeyComplete && <FinalCompletion />}
    </>
  )
}
