import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore.js'

export function FinalCompletion() {
  const clearJourneyComplete = useAppStore((s) => s.clearJourneyComplete)
  const loadKingdoms = useAppStore((s) => s.loadKingdoms)
  const navigate = useNavigate()
  const [phase, setPhase] = useState('dark')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('glow'), 800)
    const t2 = setTimeout(() => setPhase('text'), 2500)
    return () => [t1, t2].forEach(clearTimeout)
  }, [])

  function handleDone() {
    clearJourneyComplete()
    loadKingdoms()
    navigate('/')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 cursor-pointer"
      style={{ backgroundColor: '#0a0806' }}
      onClick={handleDone}
    >
      {/* Radial glow */}
      <div
        className="absolute rounded-full transition-all duration-[2000ms]"
        style={{
          width: phase !== 'dark' ? '800px' : '0',
          height: phase !== 'dark' ? '800px' : '0',
          background: 'radial-gradient(circle, #D4860B22 0%, #5A2D7A11 50%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div
        className="text-center transition-all duration-700 flex flex-col gap-4 relative"
        style={{
          opacity: phase === 'text' ? 1 : 0,
          transform: phase === 'text' ? 'translateY(0)' : 'translateY(20px)',
        }}
      >
        <p className="text-stone-400 text-sm uppercase tracking-widest">The journey is complete</p>
        <h1 className="text-5xl font-bold text-amber-200">Land-of-Almost-Awake</h1>
        <p className="text-stone-300 italic text-lg max-w-sm mx-auto">
          All six kingdoms have been explored. Your story lives here forever.
        </p>
        <p className="text-stone-500 text-sm mt-4">Tap to return to the world</p>
      </div>
    </div>
  )
}
