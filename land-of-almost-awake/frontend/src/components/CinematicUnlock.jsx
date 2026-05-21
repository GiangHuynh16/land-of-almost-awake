import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore.js'
import { KINGDOM_COLORS } from '../lib/constants.js'

export function CinematicUnlock({ kingdom, catchUp }) {
  const clearUnlock = useAppStore((s) => s.clearUnlock)
  const [phase, setPhase] = useState('fade-in')

  const colors = kingdom ? KINGDOM_COLORS[kingdom.name] : null
  const duration = catchUp ? 2000 : 3500

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('burst'), duration * 0.3)
    const t2 = setTimeout(() => setPhase('name'), duration * 0.55)
    const t3 = setTimeout(() => setPhase('fade-out'), duration * 0.8)
    const t4 = setTimeout(() => clearUnlock(), duration)
    return () => [t1, t2, t3, t4].forEach(clearTimeout)
  }, [clearUnlock, duration])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-700"
      style={{
        backgroundColor: '#0a0806',
        opacity: phase === 'fade-out' ? 0 : 1,
      }}
    >
      {/* Glow burst */}
      <div
        className="absolute rounded-full transition-all duration-700"
        style={{
          width: phase === 'burst' || phase === 'name' ? '600px' : '0px',
          height: phase === 'burst' || phase === 'name' ? '600px' : '0px',
          backgroundColor: colors?.glow || '#F5C04A',
          opacity: 0.12,
          filter: 'blur(80px)',
        }}
      />

      {/* Kingdom name */}
      <div
        className="text-center transition-all duration-500"
        style={{
          opacity: phase === 'name' || phase === 'fade-out' ? 1 : 0,
          transform: phase === 'name' || phase === 'fade-out' ? 'scale(1)' : 'scale(0.8)',
        }}
      >
        {kingdom && (
          <>
            <p className="text-stone-400 text-sm mb-2 uppercase tracking-widest">
              {catchUp ? 'Previously unlocked' : 'Kingdom unlocked'}
            </p>
            <h1
              className="text-6xl font-bold"
              style={{ color: colors?.accent }}
            >
              {kingdom.name}
            </h1>
            <p className="text-stone-300 text-lg mt-2 italic">{kingdom.meaning}</p>
          </>
        )}
      </div>
    </div>
  )
}
