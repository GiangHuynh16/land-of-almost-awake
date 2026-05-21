import { Routes, Route, Navigate } from 'react-router-dom'
import Astrolabe from './astrolabe/world/Astrolabe.jsx'
import KingdomDetail from './astrolabe/kingdom/KingdomDetail.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Astrolabe />} />
      <Route path="/kingdom/:id" element={<KingdomDetail />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
