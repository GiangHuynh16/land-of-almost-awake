import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore.js'
import { WorldMapSVG } from '../components/WorldMapSVG.jsx'

export default function WorldMap() {
  const kingdoms = useAppStore((s) => s.kingdoms)
  const loadKingdoms = useAppStore((s) => s.loadKingdoms)
  const navigate = useNavigate()

  useEffect(() => {
    loadKingdoms()
  }, [])

  function handleKingdomClick(kingdom) {
    navigate(`/kingdom/${kingdom.id}`)
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-stone-950">
      <div className="w-full h-full max-w-5xl">
        <WorldMapSVG kingdoms={kingdoms} onKingdomClick={handleKingdomClick} />
      </div>
    </div>
  )
}
