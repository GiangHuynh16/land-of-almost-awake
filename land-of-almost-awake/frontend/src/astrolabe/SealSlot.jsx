import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import { GLYPHS, STAMP_KEYS } from './glyphs.jsx'
import { lighten, darken } from './colors.js'

export function SealSlot({
  size = 56,
  color = '#e89060',
  state = 'empty',
  chosen,
  pickerStamps = STAMP_KEYS.slice(0, 10),
  onSeal,
  disabled = false,
  label,
  pickerDir = 'up',
}) {
  const [pickerAnchor, setPickerAnchor] = useState(null)
  const [stage, setStage] = useState('idle')
  const [picked, setPicked] = useState(null)
  const timers = useRef([])
  const slotRef = useRef(null)

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  function runCeremony(glyph) {
    setPickerAnchor(null)
    setPicked(glyph)
    setStage('drop')
    const T = timers.current
    T.push(setTimeout(() => setStage('quiver'), 320))
    T.push(setTimeout(() => setStage('descend'), 520))
    T.push(setTimeout(() => setStage('impact'), 820))
    T.push(setTimeout(() => setStage('lift'), 1000))
    T.push(setTimeout(() => setStage('shimmer'), 1200))
    T.push(setTimeout(() => {
      setStage('done')
      onSeal && onSeal(glyph)
    }, 1750))
  }

  const isSealed = state === 'sealed'
  const isWaiting = state === 'waiting'
  const ceremonyActive = stage !== 'idle' && stage !== 'done'

  // for safety: support CSS variable colors (like "var(--k-veritas-a)") by passing fallback to gradient defs
  const isCssVar = typeof color === 'string' && color.startsWith('var(')
  const sanitizedColor = isCssVar ? '#7adfe2' : color

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-block' }}>
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <circle cx="50" cy="50" r="48" fill="none" stroke="#c89c5a" strokeWidth="1.2" opacity={disabled ? 0.25 : 0.55} />
        <circle cx="50" cy="50" r="44" fill="none" stroke="#c89c5a" strokeWidth="0.4" opacity={disabled ? 0.2 : 0.4} strokeDasharray="2 3" />
        {[0, 90, 180, 270].map(deg => {
          const a = deg * Math.PI / 180
          const cx = 50 + Math.cos(a) * 48
          const cy = 50 + Math.sin(a) * 48
          return <circle key={deg} cx={cx} cy={cy} r="2" fill="url(#brass-rivet)" opacity={disabled ? 0.3 : 0.85} />
        })}
      </svg>

      {stage === 'shimmer' && (
        <div style={{
          position: 'absolute', left: -size * 1.5, top: -size * 0.4,
          width: size * 4, height: size * 1.8,
          pointerEvents: 'none', overflow: 'hidden', zIndex: 5,
        }}>
          <div style={{
            width: '60%', height: '100%',
            background: 'linear-gradient(100deg, transparent 0%, rgba(253, 228, 160, 0) 30%, rgba(253, 228, 160, 0.7) 50%, rgba(253, 228, 160, 0) 70%, transparent 100%)',
            filter: 'blur(8px)',
            transform: 'translateX(-110%)',
            animation: 'shimmer-sweep 520ms cubic-bezier(0.22, 0.84, 0.36, 1) forwards',
          }} />
        </div>
      )}

      <div style={{
        position: 'absolute', inset: 0,
        animation: stage === 'impact' ? 'row-shake 180ms ease-out' : undefined,
      }}>
        {(isSealed && (stage === 'done' || stage === 'idle')) && (
          <GemSeal glyph={chosen || 'star'} color={sanitizedColor} />
        )}

        {!isSealed && !ceremonyActive && !isWaiting && (
          <SealButton
            color={color}
            disabled={disabled}
            onOpenPicker={(rect) => setPickerAnchor(rect)}
            onClosePicker={() => setPickerAnchor(null)}
          />
        )}

        {isWaiting && (
          <div style={{ position: 'absolute', inset: '10%', animation: 'breathe-soft 2.6s ease-in-out infinite' }}>
            <EmptySocket color={color} />
          </div>
        )}

        {(stage === 'drop' || stage === 'quiver') && (
          <div style={{
            position: 'absolute', left: '50%', top: 0,
            transform: 'translate(-50%, 0)',
            width: size * 0.7, height: size * 0.95,
            animation: stage === 'drop'
              ? 'wax-drop 380ms cubic-bezier(0.32, 0.0, 0.4, 1.6) forwards'
              : 'wax-quiver 200ms ease-in-out 1 forwards',
            transformOrigin: '50% 100%',
          }}>
            <WaxBlob color={sanitizedColor} />
          </div>
        )}

        {(stage === 'descend' || stage === 'impact' || stage === 'lift') && (
          <>
            <div style={{
              position: 'absolute', left: '50%', bottom: -4,
              width: size * 1.05, height: 6,
              transform: 'translateX(-50%)',
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 70%)',
              opacity: stage === 'descend' ? 0.4 : stage === 'impact' ? 0.85 : 0.5,
              transition: 'opacity 100ms linear',
              filter: 'blur(2px)',
            }} />
            <div style={{
              position: 'absolute', inset: 0,
              animation:
                stage === 'descend' ? 'stamp-descend 280ms cubic-bezier(0.45, 0, 0.35, 1) forwards' :
                stage === 'lift' ? 'stamp-lift 260ms cubic-bezier(0.32, 0, 0.4, 1) forwards' :
                undefined,
            }}>
              <GemSeal glyph={picked || chosen || 'star'} color={sanitizedColor} />
            </div>
          </>
        )}

        {stage === 'impact' && (
          <>{[0, 60, 120, 180, 240, 300].map((deg, i) => (
            <span key={i} style={{
              position: 'absolute', left: '50%', top: '50%',
              width: 4, height: 4, borderRadius: '50%',
              background: sanitizedColor, opacity: 0.7,
              transform: `rotate(${deg}deg) translate(${size * 0.55}px, 0)`,
              animation: 'wax-drop 240ms ease-out forwards',
              animationDelay: `${i * 6}ms`,
            }} />
          ))}</>
        )}
      </div>

      {pickerAnchor && !isSealed && !ceremonyActive && createPortal(
        <StampPicker
          color={sanitizedColor}
          stamps={pickerStamps}
          onPick={runCeremony}
          onClose={() => setPickerAnchor(null)}
          anchor={pickerAnchor}
          size={size}
        />,
        document.body
      )}

      {label && !isSealed && !ceremonyActive && (
        <div style={{
          position: 'absolute', left: '50%', top: '100%',
          transform: 'translateX(-50%)', marginTop: 6,
          fontSize: 8, letterSpacing: '0.22em',
          color: 'rgba(200, 156, 90, 0.7)',
          textTransform: 'uppercase', whiteSpace: 'nowrap', fontWeight: 500,
          fontFamily: "'JetBrains Mono', monospace",
          pointerEvents: 'none',
        }}>{label}</div>
      )}
    </div>
  )
}

function GemSeal({ glyph, color }) {
  const id = `gem-${color.replace('#', '')}-${glyph}`
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <radialGradient id={id} cx="36%" cy="32%" r="68%">
          <stop offset="0%" stopColor={lighten(color, 0.45)} />
          <stop offset="50%" stopColor={color} />
          <stop offset="100%" stopColor={darken(color, 0.45)} />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="36" fill={`url(#${id})`} />
      <ellipse cx="40" cy="36" rx="14" ry="6" fill="rgba(255, 255, 255, 0.4)" />
      <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(255, 248, 230, 0.6)" strokeWidth="0.6" />
      <circle cx="50" cy="50" r="34" fill="none" stroke={darken(color, 0.6)} strokeWidth="0.5" opacity="0.55" />
      <g transform="translate(28, 28)" style={{ color: darken(color, 0.6), mixBlendMode: 'multiply' }}>
        <svg viewBox="0 0 100 100" width="44" height="44">
          <g fill="currentColor" opacity="0.8">{GLYPHS[glyph]}</g>
        </svg>
      </g>
    </svg>
  )
}

function EmptySocket({ color }) {
  const strokeColor = typeof color === 'string' && color.startsWith('var(') ? color : color
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <radialGradient id="empty-socket" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0c0f24" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#0c0f24" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="36" fill="url(#empty-socket)" />
      <circle cx="50" cy="50" r="36" fill="none" stroke={strokeColor} strokeWidth="0.8" strokeDasharray="3 4" opacity="0.55" />
      <text x="50" y="56" textAnchor="middle" fontFamily="'Cormorant Garamond', serif" fontSize="36" fontStyle="italic" fill={strokeColor} opacity="0.4">＋</text>
    </svg>
  )
}

function WaxBlob({ color }) {
  const id = `wax-${color.replace('#', '')}`
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <radialGradient id={id} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor={lighten(color, 0.4)} />
          <stop offset="55%" stopColor={color} />
          <stop offset="100%" stopColor={darken(color, 0.4)} />
        </radialGradient>
      </defs>
      <path d="M 50 8 C 76 10, 92 28, 90 50 C 88 72, 70 90, 48 88 C 24 86, 8 68, 10 46 C 12 24, 28 6, 50 8 Z"
        fill={`url(#${id})`} />
      <ellipse cx="38" cy="30" rx="22" ry="9" fill="rgba(255, 255, 255, 0.4)" />
    </svg>
  )
}

function SealButton({ color, disabled, onOpenPicker, onClosePicker }) {
  const ref = useRef(null)
  const closeTimer = useRef(null)

  function openPicker() {
    if (disabled) return
    clearTimeout(closeTimer.current)
    if (ref.current) {
      onOpenPicker(ref.current.getBoundingClientRect())
    }
  }

  function scheduledClose() {
    closeTimer.current = setTimeout(onClosePicker, 120)
  }

  return (
    <button
      ref={ref}
      onPointerEnter={openPicker}
      onPointerLeave={scheduledClose}
      onClick={(e) => {
        e.stopPropagation()
        if (!disabled) openPicker()
      }}
      disabled={disabled}
      style={{
        all: 'unset',
        position: 'absolute', inset: '10%',
        cursor: disabled ? 'default' : 'pointer',
        borderRadius: '50%',
        transition: 'transform 240ms ease',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <EmptySocket color={color} />
    </button>
  )
}

function StampPicker({ color, stamps, onPick, onClose, anchor, size = 56 }) {
  const closeTimer = useRef(null)
  const n = stamps.length
  const radius = size * 1.55

  const cx = anchor.left + anchor.width / 2
  const cy = anchor.top + anchor.height / 2

  const arc = Math.min(n * 22, 180)
  const start = -90 - arc / 2   // always open upward

  function cancelClose() {
    clearTimeout(closeTimer.current)
  }
  function scheduleClose() {
    closeTimer.current = setTimeout(onClose, 120)
  }

  return (
    <div
      onPointerEnter={cancelClose}
      onPointerLeave={scheduleClose}
      style={{
        position: 'fixed',
        left: cx,
        top: cy,
        width: 0, height: 0,
        zIndex: 9999,
        pointerEvents: 'auto',
      }}
    >
      <div style={{
        position: 'absolute',
        left: -radius - 16, top: -radius - 16,
        width: (radius + 16) * 2, height: (radius + 16) * 2,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}22 0%, transparent 60%)`,
        pointerEvents: 'none',
      }} />
      {stamps.map((g, i) => {
        const angle = (start + (arc * i) / Math.max(1, n - 1)) * (Math.PI / 180)
        const sx = Math.cos(angle) * radius
        const sy = Math.sin(angle) * radius
        const dly = i * 26
        return (
          <button
            key={g}
            onClick={() => onPick(g)}
            style={{
              all: 'unset',
              position: 'absolute',
              left: sx - size * 0.32, top: sy - size * 0.32,
              width: size * 0.64, height: size * 0.64,
              cursor: 'pointer', borderRadius: '50%',
              background: `radial-gradient(circle at 38% 32%, ${lighten(color, 0.3)}, ${color} 65%, ${darken(color, 0.4)} 100%)`,
              boxShadow: `0 4px 12px ${darken(color, 0.5)}66, 0 0 0 1px #c89c5a99`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: darken(color, 0.5),
              transform: 'scale(0)',
              animation: `pop-in 260ms cubic-bezier(0.22, 0.84, 0.36, 1) ${dly}ms forwards`,
              transition: 'transform 180ms ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.18)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            aria-label={g}>
            <svg viewBox="0 0 100 100" width="60%" height="60%">
              <g fill="currentColor" opacity="0.85">{GLYPHS[g]}</g>
            </svg>
          </button>
        )
      })}
    </div>
  )
}
