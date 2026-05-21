import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from './store/useAppStore.js'
import { useRealtimeSync } from './hooks/useRealtimeSync.js'
import CinematicStage from './astrolabe/CinematicStage.jsx'

// Code-split everything that isn't on the critical path of an already-authed user landing on '/'.
// CinematicStage stays eager because it's the entry render after AuthGuard — lazying it added an
// extra RTT under slow networks. Auth pages, the KingdomDetail overlay, and the gated unlock /
// completion modals are all conditional, so lazy here trims first-paint JS substantially.
const Signup = lazy(() => import('./pages/auth/Signup.jsx'))
const Join = lazy(() => import('./pages/auth/Join.jsx'))
const Login = lazy(() => import('./pages/auth/Login.jsx'))
const CinematicUnlock = lazy(() => import('./components/CinematicUnlock.jsx').then(m => ({ default: m.CinematicUnlock })))
const FinalCompletion = lazy(() => import('./components/FinalCompletion.jsx').then(m => ({ default: m.FinalCompletion })))

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
      <Suspense fallback={null}>
        <Routes>
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/auth/join" element={<Join />} />
          <Route path="/auth/login" element={<Login />} />
          {/* Stage handles both '/' and '/kingdom/:id' to keep camera continuity. */}
          <Route path="/*" element={<AuthGuard><CinematicStage /></AuthGuard>} />
        </Routes>

        {pendingUnlock && <CinematicUnlock kingdom={pendingUnlock.kingdom} catchUp={pendingUnlock.catchUp} />}
        {journeyComplete && <FinalCompletion />}
      </Suspense>
    </>
  )
}
