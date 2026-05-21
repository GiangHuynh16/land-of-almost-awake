import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore.js'
import { WorldMapSVG } from '../components/WorldMapSVG.jsx'

export default function PartnerMap() {
  const partnerKingdoms = useAppStore((s) => s.partnerKingdoms)
  const partner = useAppStore((s) => s.partner)
  const loadKingdoms = useAppStore((s) => s.loadKingdoms)
  const navigate = useNavigate()

  useEffect(() => {
    loadKingdoms()
  }, [])

  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: '#0D1B3E' }}>
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => navigate('/')}
          className="text-sm px-3 py-1 rounded border transition-colors"
          style={{ color: '#8A9BB8', borderColor: '#243060' }}
        >
          ← My Map
        </button>
        <span style={{ color: '#8A9BB8' }} className="text-sm italic">
          Viewing {partner?.display_name || 'Partner'}'s kingdoms
        </span>
      </div>
      <div className="flex-1">
        <WorldMapSVG
          kingdoms={partnerKingdoms}
          sharedKingdom={null}
          onKingdomClick={(k) => navigate(`/kingdom/${k.id}?scope=partner`)}
          readOnly
        />
      </div>
    </div>
  )
}
