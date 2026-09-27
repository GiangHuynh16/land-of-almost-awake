import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore.js'
import { KINGDOMS } from '../astrolabe/data.js'
import { lighten, darken } from '../astrolabe/colors.js'
import { GLYPHS } from '../astrolabe/glyphs.jsx'

export default function PartnerMap() {
  const partnerKingdoms = useAppStore((s) => s.partnerKingdoms)
  const partner = useAppStore((s) => s.partner)
  const loadPartnerKingdoms = useAppStore((s) => s.loadPartnerKingdoms)
  const navigate = useNavigate()

  useEffect(() => {
    loadPartnerKingdoms()
  }, [])

  // Merge backend progress into static KINGDOMS data
  const enriched = KINGDOMS.map((k) => {
    const progress = partnerKingdoms.find((p) => p.id === k.id)
    return {
      ...k,
      sealed: progress?.completed_count ?? 0,
      status: progress?.status ?? 'locked',
    }
  })

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse at 50% 50%, #0a0f30 0%, #060815 60%, #030414 100%)',
      overflow: 'hidden',
    }}>
      {/* Back header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 20px',
        background: 'linear-gradient(180deg, rgba(6, 8, 21, 0.85) 0%, transparent 100%)',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            all: 'unset', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 16px',
            background: 'rgba(7, 9, 30, 0.7)',
            border: '1px solid rgba(200, 156, 90, 0.35)',
            borderRadius: 999,
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 14, fontStyle: 'italic',
            color: 'rgba(243, 236, 217, 0.85)',
            transition: 'border-color 220ms ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(200, 156, 90, 0.65)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(200, 156, 90, 0.35)'}
        >
          ← my map
        </button>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 14, fontStyle: 'italic',
          color: 'rgba(200, 156, 90, 0.8)',
        }}>
          {partner?.display_name
            ? `viewing ${partner.display_name}'s kingdoms`
            : 'partner map'}
        </div>
      </div>

      {/* Kingdom grid */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '80px 24px 24px',
        gap: 20,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 16, width: '100%', maxWidth: 880,
        }}>
          {enriched.map((k) => (
            <PartnerKingdomCard key={k.id} kingdom={k} />
          ))}
        </div>
      </div>
    </div>
  )
}

function PartnerKingdomCard({ kingdom: k }) {
  const { color, colorAlt } = k
  const mainColor = color || '#c89c5a'
  const progress = Math.min(1, (k.sealed ?? 0) / (k.total ?? 10))
  const isLocked = k.status === 'locked'

  return (
    <div style={{
      position: 'relative',
      padding: '20px 16px 16px',
      background: 'linear-gradient(180deg, rgba(28, 22, 14, 0.82), rgba(10, 8, 6, 0.75))',
      border: `1px solid ${isLocked ? 'rgba(200, 156, 90, 0.18)' : 'rgba(200, 156, 90, 0.38)'}`,
      borderRadius: 6,
      opacity: isLocked ? 0.55 : 1,
      transition: 'opacity 300ms ease',
      backdropFilter: 'blur(8px)',
      overflow: 'hidden',
    }}>
      {/* Corner accents */}
      {['tl', 'tr', 'bl', 'br'].map(p => {
        const [v, h] = p.split('')
        return <div key={p} style={{
          position: 'absolute',
          [v === 't' ? 'top' : 'bottom']: -1,
          [h === 'l' ? 'left' : 'right']: -1,
          width: 8, height: 8,
          [`border${v === 't' ? 'Top' : 'Bottom'}`]: `1px solid ${isLocked ? 'rgba(200,156,90,0.3)' : '#c89c5a'}`,
          [`border${h === 'l' ? 'Left' : 'Right'}`]: `1px solid ${isLocked ? 'rgba(200,156,90,0.3)' : '#c89c5a'}`,
        }} />
      })}

      {/* Glyph orb */}
      <div style={{
        width: 52, height: 52, borderRadius: '50%', margin: '0 auto 12px',
        background: `radial-gradient(circle at 36% 32%, ${lighten(mainColor, 0.45)}, ${mainColor} 55%, ${darken(mainColor, 0.45)})`,
        border: '1px solid rgba(200, 156, 90, 0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: darken(mainColor, 0.55),
        boxShadow: isLocked ? 'none' : `0 0 18px ${mainColor}44`,
      }}>
        <svg viewBox="0 0 100 100" width="26" height="26">
          <g fill="currentColor" opacity="0.85">{GLYPHS[k.id]}</g>
        </svg>
      </div>

      {/* Name */}
      <div style={{
        textAlign: 'center',
        fontFamily: "'Cormorant Garamond', serif",
        fontStyle: 'italic', fontWeight: 500,
        fontSize: 18, color: 'rgba(247, 236, 217, 0.92)',
        lineHeight: 1, marginBottom: 4,
      }}>{k.serif}</div>

      {/* Verb */}
      <div style={{
        textAlign: 'center',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 7.5, letterSpacing: '0.3em',
        color: 'rgba(200, 156, 90, 0.65)',
        marginBottom: 12, textTransform: 'uppercase',
      }}>
        {isLocked ? 'locked' : `✦  ${k.verb}  ✦`}
      </div>

      {/* Progress bar */}
      {!isLocked && (
        <div style={{ position: 'relative', height: 3, borderRadius: 2, background: 'rgba(200, 156, 90, 0.18)' }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${progress * 100}%`, borderRadius: 2,
            background: `linear-gradient(90deg, ${mainColor}, ${lighten(mainColor, 0.3)})`,
            transition: 'width 700ms cubic-bezier(0.22, 0.84, 0.36, 1)',
            boxShadow: `0 0 6px ${mainColor}88`,
          }} />
        </div>
      )}
      {!isLocked && (
        <div style={{
          marginTop: 6, textAlign: 'right',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 7.5, letterSpacing: '0.2em',
          color: 'rgba(200, 156, 90, 0.55)',
        }}>
          {k.sealed}/{k.total}
        </div>
      )}

      {/* Completed badge */}
      {k.status === 'completed' && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 7, letterSpacing: '0.2em',
          color: 'rgba(158, 212, 181, 0.85)',
          background: 'rgba(158, 212, 181, 0.12)',
          border: '1px solid rgba(158, 212, 181, 0.3)',
          borderRadius: 3, padding: '2px 5px',
        }}>DONE</div>
      )}
    </div>
  )
}
