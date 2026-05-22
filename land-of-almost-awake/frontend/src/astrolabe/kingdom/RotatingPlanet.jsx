import { GLYPHS } from '../glyphs.jsx'
import { darken, lighten } from '../colors.js'

export function RotatingPlanet({ kingdom, isMiveritas }) {
  const c = kingdom.color
  const cDeep = darken(c, 0.55)

  if (!isMiveritas) {
    return (
      <div style={{
        position: 'relative',
        width: 'min(78vmin, 560px)', height: 'min(78vmin, 560px)',
        maxWidth: '100%', maxHeight: '100%',
      }}>
        <div style={{ position: 'absolute', inset: 0, animation: 'planet-spin 90s linear infinite' }}>
          <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
            <circle cx="100" cy="100" r="98" fill="none" stroke="#c89c5a" strokeWidth="0.4" opacity="0.7" />
            <circle cx="100" cy="100" r="98" fill="none" stroke="#c89c5a" strokeWidth="0.15" opacity="0.55" strokeDasharray="1 3" />
            {Array.from({ length: 36 }).map((_, i) => {
              const a = (i / 36) * Math.PI * 2
              const long = i % 9 === 0
              const x1 = 100 + Math.cos(a) * (long ? 92 : 95)
              const y1 = 100 + Math.sin(a) * (long ? 92 : 95)
              const x2 = 100 + Math.cos(a) * 98
              const y2 = 100 + Math.sin(a) * 98
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c89c5a" strokeWidth={long ? 0.5 : 0.25} opacity={long ? 0.85 : 0.5} />
            })}
            {[0, 90, 180, 270].map(deg => {
              const a = deg * Math.PI / 180
              const x = 100 + Math.cos(a) * 98
              const y = 100 + Math.sin(a) * 98
              return <circle key={deg} cx={x} cy={y} r="2.5" fill="url(#brass-rivet)" />
            })}
          </svg>
        </div>

        <div style={{ position: 'absolute', inset: '8%', animation: 'planet-spin-rev 64s linear infinite' }}>
          <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
            <circle cx="100" cy="100" r="92" fill="none" stroke="#c89c5a" strokeWidth="0.3" opacity="0.55" />
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i / 12) * Math.PI * 2 - Math.PI / 2
              const x = 100 + Math.cos(a) * 92
              const y = 100 + Math.sin(a) * 92
              return (
                <text key={i} x={x} y={y + 3} textAnchor="middle"
                  fontFamily="'Cormorant Unicase', serif" fontSize="6" fill="#c89c5a" opacity="0.75" letterSpacing="1">
                  {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][i]}
                </text>
              )
            })}
          </svg>
        </div>

        <div style={{
          position: 'absolute', inset: '10%', borderRadius: '50%',
          background: `radial-gradient(circle, ${c}55 0%, transparent 70%)`,
          filter: 'blur(28px)', pointerEvents: 'none',
          animation: 'breathe 6s ease-in-out infinite',
        }} />

        <div style={{
          position: 'absolute', inset: '14%', borderRadius: '50%',
          overflow: 'hidden',
          background: `radial-gradient(circle at 35% 32%, ${lighten(c, 0.5)} 0%, ${c} 45%, ${darken(c, 0.45)} 100%)`,
          boxShadow: `0 0 60px ${c}55, inset -30px -30px 60px ${darken(c, 0.55)}, inset 18px 18px 40px ${lighten(c, 0.18)}`,
        }}>
          <div style={{
            position: 'absolute', left: '-50%', right: '-50%', top: '20%', height: '60%',
            background: `repeating-linear-gradient(96deg, transparent 0%, ${lighten(c, 0.3)}33 18%, transparent 36%, ${c}33 54%, transparent 72%)`,
            backgroundSize: '200% 100%',
            animation: 'planet-band 24s linear infinite',
            mixBlendMode: 'screen', pointerEvents: 'none', opacity: 0.6,
          }} />
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'linear-gradient(95deg, transparent 0%, transparent 50%, rgba(0, 0, 0, 0.55) 100%)',
            mixBlendMode: 'multiply', pointerEvents: 'none',
            animation: 'planet-shadow 60s ease-in-out infinite alternate',
          }} />
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'radial-gradient(circle at 38% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 25%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: cDeep, mixBlendMode: 'multiply', opacity: 0.75,
            animation: 'glyph-drift 16s ease-in-out infinite',
          }}>
            <svg viewBox="0 0 100 100" width="56%" height="56%">
              <g fill="currentColor">{GLYPHS[kingdom.id]}</g>
            </svg>
          </div>
        </div>

        <div style={{
          position: 'absolute', inset: '14%', borderRadius: '50%',
          border: `1px solid ${darken(c, 0.4)}`,
          boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.55)',
          pointerEvents: 'none',
        }} />

        {[40, 120, 220].map((dur, i) => (
          <div key={i} style={{
            position: 'absolute', inset: 0,
            animation: `planet-spin ${dur}s linear infinite`,
          }}>
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 5, height: 5, borderRadius: '50%',
              transform: `translate(-50%, -50%) translateX(${44 + i * 4}%)`,
              background: lighten(c, 0.4),
              boxShadow: `0 0 12px ${c}`,
            }} />
          </div>
        ))}

        <PlanetProgressArc kingdom={kingdom} />
      </div>
    )
  }

  // Miveritas — dual planet
  return (
    <div style={{
      position: 'relative',
      width: 'min(78vmin, 560px)', height: 'min(78vmin, 560px)',
      maxWidth: '100%', maxHeight: '100%',
    }}>
      <div style={{ position: 'absolute', inset: 0, animation: 'planet-spin 90s linear infinite' }}>
        <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
          <circle cx="100" cy="100" r="98" fill="none" stroke="#c89c5a" strokeWidth="0.4" opacity="0.75" />
          {[0, 60, 120, 180, 240, 300].map(deg => {
            const a = deg * Math.PI / 180
            const x = 100 + Math.cos(a) * 98
            const y = 100 + Math.sin(a) * 98
            return <circle key={deg} cx={x} cy={y} r="2.6" fill="url(#brass-rivet)" />
          })}
          {Array.from({ length: 48 }).map((_, i) => {
            const a = (i / 48) * Math.PI * 2
            const x1 = 100 + Math.cos(a) * 95
            const y1 = 100 + Math.sin(a) * 95
            const x2 = 100 + Math.cos(a) * 98
            const y2 = 100 + Math.sin(a) * 98
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c89c5a" strokeWidth="0.25" opacity="0.55" />
          })}
        </svg>
      </div>

      <div style={{ position: 'absolute', inset: '5%', animation: 'planet-spin 80s linear infinite', pointerEvents: 'none' }}>
        <svg viewBox="-100 -100 200 200" style={{ width: '100%', height: '100%' }}>
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2
            const x = Math.cos(a) * 80
            const y = Math.sin(a) * 80
            return <line key={i} x1="0" y1="0" x2={x} y2={y}
              stroke={i % 2 ? 'var(--k-veritas-a)' : 'var(--k-veritas-b)'}
              strokeWidth="1.5" opacity="0.35" />
          })}
        </svg>
      </div>

      <div style={{
        position: 'absolute', inset: '10%', borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 32%, rgba(122, 223, 226, 0.5) 0%, transparent 65%), radial-gradient(circle at 70% 65%, rgba(228, 137, 200, 0.5) 0%, transparent 65%)',
        filter: 'blur(36px)', pointerEvents: 'none',
        animation: 'breathe 6s ease-in-out infinite',
      }} />

      <div style={{
        position: 'absolute', inset: '14%', borderRadius: '50%',
        overflow: 'hidden',
        background: 'radial-gradient(circle at 30% 30%, white 0%, var(--k-veritas-a) 38%, #2e7479 100%)',
        boxShadow: '0 0 80px rgba(122, 223, 226, 0.55), inset -30px -30px 60px rgba(11, 18, 50, 0.55)',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 75% 75%, var(--k-veritas-b) 0%, transparent 50%)',
          mixBlendMode: 'screen', opacity: 0.85, pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', left: '-50%', right: '-50%', top: '25%', height: '55%',
          background: 'repeating-linear-gradient(95deg, transparent 0%, rgba(255, 255, 255, 0.18) 18%, transparent 36%, rgba(228, 137, 200, 0.18) 54%, transparent 72%)',
          backgroundSize: '200% 100%',
          animation: 'planet-band 28s linear infinite',
          mixBlendMode: 'screen', pointerEvents: 'none', opacity: 0.7,
        }} />
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'linear-gradient(100deg, transparent 0%, transparent 55%, rgba(0, 0, 0, 0.4) 100%)',
          mixBlendMode: 'multiply', pointerEvents: 'none',
          animation: 'planet-shadow 60s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 25%, rgba(255, 255, 255, 0.55) 0%, transparent 22%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(6, 34, 45, 0.7)',
          mixBlendMode: 'multiply', opacity: 0.75,
          animation: 'glyph-drift 16s ease-in-out infinite',
        }}>
          <svg viewBox="0 0 100 100" width="50%" height="50%">
            <g fill="currentColor">{GLYPHS.miveritas}</g>
          </svg>
        </div>
      </div>

      <div style={{
        position: 'absolute', inset: '14%', borderRadius: '50%',
        border: '1px solid rgba(255, 248, 230, 0.4)',
        boxShadow: 'inset 0 0 24px rgba(0, 0, 0, 0.55)',
        pointerEvents: 'none',
      }} />

      {[36, 120, 200].map((dur, i) => (
        <div key={i} style={{
          position: 'absolute', inset: 0,
          animation: `planet-spin ${dur}s linear infinite`,
        }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 5, height: 5, borderRadius: '50%',
            transform: `translate(-50%, -50%) translateX(${44 + i * 4}%)`,
            background: i % 2 ? 'var(--k-veritas-b)' : 'var(--k-veritas-a)',
            boxShadow: `0 0 14px ${i % 2 ? 'var(--k-veritas-b)' : 'var(--k-veritas-a)'}`,
          }} />
        </div>
      ))}

      <PlanetProgressArc kingdom={kingdom} />
    </div>
  )
}

function PlanetProgressArc({ kingdom }) {
  const sealed = kingdom.sealed || 0
  const total = kingdom.total || 1
  const pct = Math.min(1, sealed / total)
  const C = 2 * Math.PI * 101
  const isMiv = !!kingdom.dual
  return (
    <svg viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      <circle cx="100" cy="100" r="101" fill="none"
        stroke={isMiv ? 'var(--k-veritas-a)' : kingdom.color}
        strokeWidth="1.4"
        strokeDasharray={C} strokeDashoffset={C * (1 - pct)}
        strokeLinecap="round"
        transform="rotate(-90 100 100)"
        opacity="0.8"
        style={{ transition: 'stroke-dashoffset 800ms cubic-bezier(0.22, 0.84, 0.36, 1)' }} />
      {isMiv && (() => {
        const pctOther = Math.min(1, (kingdom.sealedOther || 0) / total)
        const Cb = 2 * Math.PI * 104
        return (
          <circle cx="100" cy="100" r="104" fill="none"
            stroke="var(--k-veritas-b)" strokeWidth="1.2"
            strokeDasharray={Cb} strokeDashoffset={Cb * (1 - pctOther)}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
            opacity="0.75"
            style={{ transition: 'stroke-dashoffset 800ms cubic-bezier(0.22, 0.84, 0.36, 1)' }} />
        )
      })()}
    </svg>
  )
}
