import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore.js'
import { Aurora, BrassDefs, BrassRing, Motes, NebulaBackdrop, Stars, useViewport } from '../atmosphere.jsx'
import { GLYPHS } from '../glyphs.jsx'
import { KINGDOMS, RECENT_SEALS } from '../data.js'
import { darken, lighten } from '../colors.js'

const ROMAN_HOURS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const DAY_LABELS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const HOUR_TINTS = [
  { bg: 'radial-gradient(ellipse at 50% 60%, #2a1f4a 0%, #160e2e 50%, #060312 100%)', nebula: 'warm' },
  { bg: 'radial-gradient(ellipse at 50% 55%, #1c1844 0%, #100b28 50%, #050310 100%)', nebula: 'warm' },
  { bg: 'radial-gradient(ellipse at 50% 50%, #14143a 0%, #0a0b22 50%, #04030e 100%)', nebula: 'violet' },
  { bg: 'radial-gradient(ellipse at 50% 48%, #101238 0%, #080a20 50%, #03030c 100%)', nebula: 'violet' },
  { bg: 'radial-gradient(ellipse at 50% 45%, #0c1232 0%, #07091e 50%, #030414 100%)', nebula: 'default' },
  { bg: 'radial-gradient(ellipse at 50% 45%, #0a0f30 0%, #06081c 50%, #020310 100%)', nebula: 'default' },
  { bg: 'radial-gradient(ellipse at 50% 45%, #080d2c 0%, #050618 50%, #020210 100%)', nebula: 'deep' },
  { bg: 'radial-gradient(ellipse at 50% 45%, #0a0f30 0%, #06081c 50%, #020310 100%)', nebula: 'deep' },
  { bg: 'radial-gradient(ellipse at 50% 45%, #0c1232 0%, #07091e 50%, #030414 100%)', nebula: 'default' },
  { bg: 'radial-gradient(ellipse at 50% 42%, #101430 0%, #080a1e 50%, #030412 100%)', nebula: 'default' },
  { bg: 'radial-gradient(ellipse at 50% 40%, #18173a 0%, #0c0d24 50%, #050414 100%)', nebula: 'cyan' },
  { bg: 'radial-gradient(ellipse at 50% 38%, #20203c 0%, #121028 50%, #060514 100%)', nebula: 'cyan' },
  { bg: 'radial-gradient(ellipse at 50% 35%, #2c2840 0%, #18152c 50%, #0a0816 100%)', nebula: 'pale' },
]

const ZODIAC = [
  { p: 'M 4 16 Q 12 4, 20 16 M 8 12 Q 12 8, 16 12' },
  { p: 'M 4 14 L 20 14 M 6 14 L 6 18 M 18 14 L 18 18 M 9 10 L 9 14 M 15 10 L 15 14' },
  { p: 'M 4 6 L 6 18 M 18 6 L 20 18 M 6 9 L 18 9 M 8 18 L 16 18' },
  { p: 'M 6 10 Q 12 6, 18 10 Q 18 16, 12 18 Q 6 16, 6 10 Z M 12 6 L 12 18' },
  { p: 'M 4 14 Q 8 6, 12 12 Q 16 18, 20 10 L 20 16' },
  { p: 'M 6 6 L 6 18 M 12 8 L 12 18 M 18 6 L 18 18 M 12 8 Q 14 14, 12 18' },
  { p: 'M 4 10 L 20 10 M 4 14 L 20 14 M 8 14 Q 12 18, 16 14' },
  { p: 'M 4 8 L 4 16 M 4 12 Q 12 12, 14 8 L 18 8 L 16 12 L 20 12' },
  { p: 'M 6 18 L 18 8 M 14 6 L 18 8 L 18 12' },
  { p: 'M 4 6 L 8 14 L 12 6 L 16 14 L 20 6 M 12 14 Q 12 18, 14 18' },
  { p: 'M 4 10 Q 8 8, 12 10 Q 16 8, 20 10 M 4 14 Q 8 12, 12 14 Q 16 12, 20 14' },
  { p: 'M 4 6 Q 12 12, 4 18 M 20 6 Q 12 12, 20 18 M 8 12 L 16 12' },
]

const MOON_NAMES = ['new', 'waxing crescent', 'first quarter', 'waxing gibbous', 'full', 'waning gibbous', 'last quarter', 'waning crescent']

function moonClip(phase) {
  if (phase === 0) return 'inset(100%)'
  if (phase === 4) return 'inset(0)'
  if (phase < 4) {
    const w = 100 - (phase * 25)
    return `polygon(${w}% 0%, 100% 0%, 100% 100%, ${w}% 100%)`
  }
  const w = (8 - phase) * 25
  return `polygon(0% 0%, ${w}% 0%, ${w}% 100%, 0% 100%)`
}

export default function Astrolabe({ onSelectKingdom, dimExcept = null, cinematic = false }) {
  const [hover, setHover] = useState(null)
  const user = useAppStore((s) => s.user)
  const partner = useAppStore((s) => s.partner)
  const vp = useViewport()
  const isNarrow = vp.w < 720
  const cx = 500
  const cy = isNarrow ? 380 : 360

  // When CinematicStage is mid-camera move (dive/kingdom/rising), dimExcept is non-null.
  // World view = no kingdom in focus = show all HTML overlays.
  const worldMode = !dimExcept

  const [hora, setHora] = useState(8)
  const [dies, setDies] = useState(3)
  const [moonPhase, setMoonPhase] = useState(2)

  const moonBright = Math.cos(((moonPhase - 4) / 8) * Math.PI * 2) * 0.5 + 0.5
  const hourTint = HOUR_TINTS[hora] || HOUR_TINTS[8]
  const dayLabel = DAY_LABELS[dies] || DAY_LABELS[3]
  const dayLog = RECENT_SEALS.filter(s => s.when === DAY_LABELS[dies])

  function openKingdom(id, event) {
    if (!onSelectKingdom) return
    const orbEl = event?.currentTarget?.querySelector?.('[data-orb-core]') ?? event?.currentTarget
    const bbox = orbEl?.getBoundingClientRect?.()
    const pos = bbox
      ? {
          x: bbox.left + bbox.width / 2,
          y: bbox.top + bbox.height / 2,
          size: Math.max(bbox.width, bbox.height),
        }
      : null
    onSelectKingdom(id, pos)
  }

  const outerKingdoms = KINGDOMS.filter(k => k.id !== 'miveritas')
  const miveritas = KINGDOMS.find(k => k.id === 'miveritas')

  return (
    <div
      className={cinematic ? 'astrolabe-cinematic' : undefined}
      style={{
        position: 'absolute', inset: 0,
        background: hourTint.bg,
        overflow: 'hidden',
        transition: cinematic ? 'none' : 'background 900ms ease',
      }}
    >
      <BrassDefs />

      {/* Star count tuned for DOM weight — 506→220 (milky band still reads dense at this opacity). */}
      <Stars count={170} seed={4} opacity={0.92} milky />
      <Stars count={40} seed={17} opacity={0.55} />
      <Stars count={10} seed={31} opacity={1} />

      <NebulaBackdrop tint={hourTint.nebula} brightness={0.5 + moonBright * 0.5} />
      {!cinematic && <Aurora variant="miveritas" intensity={0.35 + (1 - moonBright) * 0.3} />}
      {!cinematic && <Motes count={30} color="#fde4a0" />}
      {!cinematic && <div className="grain-dark" style={{ opacity: 0.18 }} />}

      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 8% 14%, rgba(243, 236, 217, ${0.05 + moonBright * 0.12}) 0%, transparent 35%)`,
        pointerEvents: 'none', transition: 'background 900ms ease',
      }} />

      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 48%, rgba(200, 156, 90, 0.22) 0%, transparent 38%)',
        pointerEvents: 'none',
      }} />

      <svg viewBox={isNarrow ? '100 80 800 620' : '0 0 1000 720'} preserveAspectRatio="xMidYMid meet"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id="astro-plate" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3a3520" stopOpacity="0.45" />
            <stop offset="55%" stopColor="#1f1b10" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#0c0f24" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="brass-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f0d49a" />
            <stop offset="50%" stopColor="#c89c5a" />
            <stop offset="100%" stopColor="#7a5618" />
          </linearGradient>
          <radialGradient id="brass-rivet" cx="35%" cy="30%">
            <stop offset="0%" stopColor="#fde4a0" />
            <stop offset="50%" stopColor="#c89c5a" />
            <stop offset="100%" stopColor="#3a2a10" />
          </radialGradient>
          <filter id="bloom-soft" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
          <filter id="bloom-strong" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
        </defs>

        <ZodiacField />

        <circle cx={cx} cy={cy} r="338" fill="url(#astro-plate)" />

        <ZodiacRing cx={cx} cy={cy} r={314} />

        <BrassRing cx={cx} cy={cy} r={266} color="#c89c5a" strokeWidth={0.5} ticks={48} opacity={0.55} />
        <BrassRing cx={cx} cy={cy} r={252} color="#c89c5a" strokeWidth={0.3} ticks={24} opacity={0.4} dashed />
        {ROMAN_HOURS.map((roman, i) => {
          const a = (i / 12) * Math.PI * 2 - Math.PI / 2
          const rx = cx + Math.cos(a) * 259
          const ry = cy + Math.sin(a) * 259
          return (
            <text key={i} x={rx} y={ry} textAnchor="middle" dominantBaseline="middle"
              fontFamily="'Cormorant Unicase', serif" fontSize="12" fill="#c89c5a"
              opacity="0.85" letterSpacing="2">{roman}</text>
          )
        })}

        <BrassRing cx={cx} cy={cy} r={206} color="#c89c5a" strokeWidth={0.6} ticks={60} opacity={0.6} />
        <circle cx={cx} cy={cy} r="206" fill="none" stroke="#c89c5a" strokeWidth="0.25" opacity="0.45" />
        <KingdomVerbsRing cx={cx} cy={cy} r={186} />

        <g opacity="0.5">
          {outerKingdoms.map((k, i) => {
            const slots = 5
            const a = (i / slots) * Math.PI * 2 - Math.PI / 2 + Math.PI / 10
            const r = 162
            const x = cx + Math.cos(a) * r
            const y = cy + Math.sin(a) * r
            return (
              <g key={k.id}>
                <line x1={cx} y1={cy} x2={x} y2={y}
                  stroke="rgba(200, 156, 90, 0.4)" strokeWidth="0.5" strokeDasharray="2 4" />
                {!cinematic && (
                  <circle r="1.5" fill="#fde4a0" opacity="0.85">
                    <animate attributeName="cx" values={`${cx};${x};${cx}`} dur={`${9 + i}s`} repeatCount="indefinite" />
                    <animate attributeName="cy" values={`${cy};${y};${cy}`} dur={`${9 + i}s`} repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0;0.9;0" dur={`${9 + i}s`} repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            )
          })}
          {(() => {
            const slots = 5
            const pts = outerKingdoms.map((_, i) => {
              const a = (i / slots) * Math.PI * 2 - Math.PI / 2 + Math.PI / 10
              return [cx + Math.cos(a) * 162, cy + Math.sin(a) * 162]
            })
            const d = 'M ' + pts.map(p => p.join(' ')).join(' L ') + ' Z'
            return <path d={d} stroke="rgba(200, 156, 90, 0.25)" strokeWidth="0.4" fill="none" strokeDasharray="1 3" />
          })()}
        </g>

        <g style={{
          transformOrigin: `${cx}px ${cy}px`,
          animation: cinematic ? 'none' : 'alidade-rotate 240s linear infinite',
        }}>
          <line x1={cx - 296} y1={cy} x2={cx + 296} y2={cy}
            stroke="url(#brass-grad)" strokeWidth="2.6" strokeLinecap="round" opacity="0.55" />
          <line x1={cx - 296} y1={cy} x2={cx + 296} y2={cy}
            stroke="#fde4a0" strokeWidth="0.5" strokeLinecap="round" opacity="0.35" />
          <circle cx={cx - 296} cy={cy} r="7" fill="url(#brass-rivet)" />
          <circle cx={cx + 296} cy={cy} r="7" fill="url(#brass-rivet)" />
          <circle cx={cx - 296} cy={cy} r="2" fill="#0c0f24" />
          <circle cx={cx + 296} cy={cy} r="2" fill="#0c0f24" />
        </g>

        {outerKingdoms.map((k, i) => {
          const slots = 5
          const a = (i / slots) * Math.PI * 2 - Math.PI / 2 + Math.PI / 10
          const r = 162
          const x = cx + Math.cos(a) * r
          const y = cy + Math.sin(a) * r
          const dimmed = dimExcept && dimExcept !== k.id
          return (
            <AstroKingdom key={k.id} k={k} cx={x} cy={y} angle={a}
              hovered={!cinematic && hover === k.id}
              dimmed={dimmed}
              cinematic={cinematic}
              swayIndex={i}
              onHover={() => setHover(k.id)}
              onLeave={() => setHover(null)}
              onOpen={(e) => openKingdom(k.id, e)} />
          )
        })}

        <AstroMiveritas cx={cx} cy={cy} k={miveritas}
          hovered={!cinematic && hover === 'miveritas'}
          dimmed={dimExcept && dimExcept !== 'miveritas'}
          onHover={() => setHover('miveritas')}
          onLeave={() => setHover(null)}
          cinematic={cinematic}
          myName={user?.display_name || 'me'}
          partnerName={partner?.display_name || 'partner'}
          onOpen={(e) => openKingdom('miveritas', e)} />

        {[0, 90, 180, 270].map(deg => {
          const a = deg * Math.PI / 180
          const x = cx + Math.cos(a) * 330
          const y = cy + Math.sin(a) * 330
          return (
            <g key={deg}>
              <circle cx={x} cy={y} r="6" fill="url(#brass-rivet)" />
              <circle cx={x} cy={y} r="2" fill="#1a1208" opacity="0.6" />
            </g>
          )
        })}

        <g opacity="0.55">
          <text x="40" y="42" fontFamily="'Cormorant Unicase', serif" fontSize="11" fill="#c89c5a" letterSpacing="3">QUADRANS · NOCTURNALIS</text>
          <text x="40" y="58" fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="#c89c5a" letterSpacing="2.5">FOR · USE · AT · THE · EDGE · OF · SLEEP</text>
          <text x="960" y="42" textAnchor="end" fontFamily="'Cormorant Unicase', serif" fontSize="11" fill="#c89c5a" letterSpacing="3">ANNO · LUNÆ · III</text>
          <text x="960" y="58" textAnchor="end" fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="#c89c5a" letterSpacing="2.5">SEPTIMANA · XII</text>
          <text x="40" y="700" fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="#c89c5a" letterSpacing="2.5">
            {user?.display_name ? `${user.display_name.toUpperCase()} · CARTOGRAPHI` : 'CARTOGRAPHI'}
          </text>
          <text x="960" y="700" textAnchor="end" fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="#c89c5a" letterSpacing="2.5">SIGILLIS · XIII · CUSTODITIS · IV</text>
        </g>
      </svg>

      {/* All HTML overlays grouped — hidden during dive/kingdom/rising so they don't
          get perspective-scaled out of viewport and produce flicker.
          Wrapper itself MUST keep pointerEvents: 'none' so SVG orb clicks pass through.
          Interactive children (MoonPhase, BrassDial) opt back in via their own style. */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: worldMode ? 1 : 0,
        transition: 'opacity 400ms ease',
        pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', left: 0, right: 0, top: '2.5%',
          textAlign: 'center', pointerEvents: 'none', zIndex: 5,
        }}>
          <div className="serif" style={{
            fontSize: 'clamp(28px, 3.4vw, 52px)',
            lineHeight: 1, fontStyle: 'italic', fontWeight: 400,
            color: 'rgba(247, 236, 207, 0.92)',
          }}>
            the Land of Almost Awake
          </div>
          <div className="smallcaps" style={{ marginTop: 6, fontSize: 9, color: 'rgba(200, 156, 90, 0.7)', letterSpacing: '0.42em' }}>
            ✦  an astrolabe for the third moon  ✦
          </div>
        </div>

        <div className="v4-only-wide"><MoonPhase phase={moonPhase} onCycle={() => setMoonPhase(p => (p + 1) % 8)} /></div>

        <div className="v4-only-wide">
          <BrassDial side="left" label="HORÆ" value={hora} setValue={setHora} min={0} max={12}
            display={`${hora}`} subDisplay={hora < 6 ? 'DUSK' : hora < 10 ? 'MIDNIGHT' : 'DAWN'} />
        </div>
        <div className="v4-only-wide">
          <BrassDial side="right" label="DIES" value={dies} setValue={setDies} min={0} max={6}
            display={DAY_LABELS_SHORT[dies]} subDisplay={dayLabel} />
        </div>

        <div className="v4-only-wide"><DayLedger day={DAY_LABELS[dies]} entries={dayLog} /></div>

        <AstroCompanionsRibbon />

        {user?.invite_code && <InviteCodeWidget code={user.invite_code} />}
        {hover && <AstroTooltip kingdom={KINGDOMS.find(k => k.id === hover)} />}
      </div>
    </div>
  )
}

function ZodiacRing({ cx, cy, r }) {
  return (
    <g>
      <BrassRing cx={cx} cy={cy} r={r + 12} color="#c89c5a" strokeWidth={0.5} ticks={72} opacity={0.55} />
      <BrassRing cx={cx} cy={cy} r={r - 12} color="#c89c5a" strokeWidth={0.3} ticks={36} opacity={0.4} />
      {ZODIAC.map((z, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2 + Math.PI / 12
        const gx = cx + Math.cos(a) * r
        const gy = cy + Math.sin(a) * r
        const da = (i / 12) * Math.PI * 2 - Math.PI / 2
        const x1 = cx + Math.cos(da) * (r - 12)
        const y1 = cy + Math.sin(da) * (r - 12)
        const x2 = cx + Math.cos(da) * (r + 12)
        const y2 = cy + Math.sin(da) * (r + 12)
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c89c5a" strokeWidth="0.35" opacity="0.5" />
            <g transform={`translate(${gx - 11}, ${gy - 11})`} style={{ color: '#c89c5a', opacity: 0.85 }}>
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path d={z.p} stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </g>
          </g>
        )
      })}
    </g>
  )
}

function KingdomVerbsRing({ cx, cy, r }) {
  const verbs = ['I  LOVE', 'I  DARE', 'I  FIGHT', 'I  DANCE', 'I  GRIEVE']
  return (
    <g opacity="0.75">
      {verbs.map((v, i) => {
        const slots = 5
        const a = (i / slots) * Math.PI * 2 - Math.PI / 2 + Math.PI / 10
        const rx = cx + Math.cos(a) * r
        const ry = cy + Math.sin(a) * r
        const rot = (a * 180 / Math.PI) + 90
        return (
          <text key={i} x={rx} y={ry} textAnchor="middle"
            transform={`rotate(${rot}, ${rx}, ${ry})`}
            fontFamily="'Cormorant Unicase', serif" fontSize="11" fill="#fde4a0"
            letterSpacing="4" opacity="0.78">
            {`✦  ${v}  ✦`}
          </text>
        )
      })}
    </g>
  )
}

function ZodiacField() {
  const patterns = [
    { ox: 130, oy: 90, pts: [[0, 0], [16, 8], [28, 2], [36, 18], [24, 30]] },
    { ox: 860, oy: 120, pts: [[0, 0], [12, 14], [26, 18], [20, 32], [36, 28]] },
    { ox: 110, oy: 590, pts: [[0, 0], [14, 10], [6, 24], [26, 22]] },
    { ox: 880, oy: 580, pts: [[0, 0], [16, 8], [12, 22], [26, 28], [40, 18]] },
    { ox: 60, oy: 340, pts: [[0, 0], [10, 18], [22, 8], [28, 24]] },
    { ox: 920, oy: 360, pts: [[0, 0], [14, 14], [8, 28], [26, 22]] },
  ]
  return (
    <g opacity="0.55">
      {patterns.map((p, i) => (
        <g key={i} transform={`translate(${p.ox}, ${p.oy})`}>
          {p.pts.slice(0, -1).map((pt, j) => (
            <line key={j} x1={pt[0]} y1={pt[1]} x2={p.pts[j + 1][0]} y2={p.pts[j + 1][1]}
              stroke="rgba(200, 156, 90, 0.3)" strokeWidth="0.3" />
          ))}
          {p.pts.map(([x, y], j) => (
            <g key={j}>
              <circle cx={x} cy={y} r="1" fill="#fde4a0" opacity="0.95">
                <animate attributeName="opacity" values="0.5;1;0.5" dur={`${3 + (j % 3)}s`} begin={`${j * 0.4}s`} repeatCount="indefinite" />
              </circle>
              <circle cx={x} cy={y} r="2.5" fill="#fde4a0" opacity="0.25" />
            </g>
          ))}
        </g>
      ))}
    </g>
  )
}

// Per-orb sway timing — duration & negative delay both varied so the 5 orbs
// never read as a synchronised wave. Values are prime-ish offsets, not random,
// so the motion is deterministic across renders.
const SWAY_DURATIONS = [10.2, 11.8, 9.6, 12.4, 10.7]
const SWAY_DELAYS = [0, -1.7, -3.4, -5.1, -6.8]

function AstroKingdom({ k, cx, cy, angle, hovered, dimmed, cinematic, swayIndex = 0, onHover, onLeave, onOpen }) {
  const r = 24
  const labelDist = 50
  const lx = cx + Math.cos(angle) * labelDist
  const ly = cy + Math.sin(angle) * labelDist
  const textAnchor = Math.cos(angle) > 0.3 ? 'start' : Math.cos(angle) < -0.3 ? 'end' : 'middle'
  const gradId = `astro-${k.id}`
  const swayDur = SWAY_DURATIONS[swayIndex % SWAY_DURATIONS.length]
  const swayDelay = SWAY_DELAYS[swayIndex % SWAY_DELAYS.length]
  return (
    <g style={{
      cursor: 'pointer',
      opacity: dimmed ? 0.18 : 1,
      transition: 'opacity 380ms ease',
      // Disabled during cinematic so the camera anchors on the orb's true centre.
      animation: cinematic ? 'none' : `orb-sway ${swayDur}s ease-in-out ${swayDelay}s infinite`,
    }}
      onMouseEnter={onHover} onMouseLeave={onLeave} onClick={(e) => onOpen(e)}>
      <defs>
        <radialGradient id={gradId} cx="36%" cy="32%" r="70%">
          <stop offset="0%" stopColor={lighten(k.color, 0.45)} />
          <stop offset="50%" stopColor={k.color} />
          <stop offset="100%" stopColor={darken(k.color, 0.45)} />
        </radialGradient>
      </defs>

      {!cinematic && <circle cx={cx} cy={cy} r={r + 14} fill={k.color} opacity="0.25" filter="url(#bloom-soft)" />}
      <circle cx={cx} cy={cy} r={r + 5} fill="none" stroke="#c89c5a" strokeWidth="1.1" opacity="0.65" />
      <circle cx={cx} cy={cy} r={r + 9} fill="none" stroke="#c89c5a" strokeWidth="0.3" opacity="0.4" />
      {[0, 90, 180, 270].map(deg => {
        const a = deg * Math.PI / 180
        return <circle key={deg} cx={cx + Math.cos(a) * (r + 7)} cy={cy + Math.sin(a) * (r + 7)} r="1.4" fill="url(#brass-rivet)" />
      })}

      <circle data-orb-core data-kingdom-id={k.id} cx={cx} cy={cy} r={r} fill={`url(#${gradId})`} opacity="0.95"
        style={{
          transformOrigin: `${cx}px ${cy}px`,
          animation: cinematic ? 'none' : 'breathe 6.5s ease-in-out infinite',
        }} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255, 248, 230, 0.55)" strokeWidth="0.5" />
      <circle cx={cx} cy={cy} r={r * 0.96} fill="none" stroke={darken(k.color, 0.6)} strokeWidth="0.3" opacity="0.45" />

      <g transform={`translate(${cx - r * 0.5}, ${cy - r * 0.5})`}
        style={{ color: darken(k.color, 0.55), opacity: 0.78, mixBlendMode: 'multiply' }}>
        <svg viewBox="0 0 100 100" width={r} height={r}>
          <g fill="currentColor">{GLYPHS[k.id]}</g>
        </svg>
      </g>

      <ProgressArc cx={cx} cy={cy} r={r + 5} progress={k.sealed / k.total} color={k.color} />

      {hovered && !cinematic && (
        <circle cx={cx} cy={cy} r={r + 5} fill="none" stroke={k.color} strokeWidth="0.8" opacity="0.55">
          <animate attributeName="r" values={`${r};${r + 24}`} dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0" dur="1.8s" repeatCount="indefinite" />
        </circle>
      )}

      <g transform={`translate(${lx}, ${ly})`}>
        <text textAnchor={textAnchor}
          fontFamily="'Cormorant Garamond', serif" fontStyle="italic" fontWeight="500"
          fontSize="20" fill="#f3ecd9" opacity="0.95">{k.serif}</text>
        <text y="14" textAnchor={textAnchor}
          fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="#c89c5a" letterSpacing="3" opacity="0.75">
          {k.sealed}/{k.total}
        </text>
      </g>
    </g>
  )
}

function AstroMiveritas({ cx, cy, k, hovered, dimmed, cinematic, onHover, onLeave, onOpen, myName = 'me', partnerName = 'partner' }) {
  const r = 50
  return (
    <g style={{
      cursor: 'pointer',
      opacity: dimmed ? 0.18 : 1,
      transition: 'opacity 380ms ease',
      // Smaller range + slower beat — Miveritas anchors the scene, shouldn't drift loud.
      animation: cinematic ? 'none' : 'orb-sway-center 16s ease-in-out -3.2s infinite',
    }}
      onMouseEnter={onHover} onMouseLeave={onLeave} onClick={(e) => onOpen(e)}>
      <defs>
        <radialGradient id="astro-mv-half-a" cx="20%" cy="35%" r="80%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="35%" stopColor={k.color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={darken(k.color, 0.45)} stopOpacity="0.9" />
        </radialGradient>
        <radialGradient id="astro-mv-half-b" cx="80%" cy="65%" r="80%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="35%" stopColor={k.colorAlt} stopOpacity="0.95" />
          <stop offset="100%" stopColor={darken(k.colorAlt, 0.45)} stopOpacity="0.9" />
        </radialGradient>
        <linearGradient id="astro-mv-blend" x1="0" x2="1">
          <stop offset="0%" stopColor={k.color} />
          <stop offset="100%" stopColor={k.colorAlt} />
        </linearGradient>
      </defs>

      <g style={{
        transformOrigin: `${cx}px ${cy}px`,
        animation: cinematic ? 'none' : 'orbit-spin 90s linear infinite',
      }} opacity="0.6">
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2
          const x = cx + Math.cos(a) * 130
          const y = cy + Math.sin(a) * 130
          return (
            <line key={i} x1={cx} y1={cy} x2={x} y2={y}
              stroke={i % 2 ? k.color : k.colorAlt} strokeWidth="1.5" opacity="0.4"
              filter="url(#bloom-soft)" />
          )
        })}
      </g>

      {!cinematic && (
        <>
          <circle cx={cx - r * 0.25} cy={cy - r * 0.1} r={r + 28} fill={k.color} opacity="0.4" filter="url(#bloom-strong)" />
          <circle cx={cx + r * 0.25} cy={cy + r * 0.1} r={r + 28} fill={k.colorAlt} opacity="0.4" filter="url(#bloom-strong)" />
        </>
      )}

      <BrassRing cx={cx} cy={cy} r={r + 28} color="#c89c5a" strokeWidth={0.6} ticks={36} opacity={0.7} />
      <BrassRing cx={cx} cy={cy} r={r + 18} color="#c89c5a" strokeWidth={0.4} ticks={24} opacity={0.5} dashed />
      {Array.from({ length: 5 }).map((_, i) => {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2 + Math.PI / 10
        const x = cx + Math.cos(a) * (r + 28)
        const y = cy + Math.sin(a) * (r + 28)
        return <circle key={i} cx={x} cy={y} r="2.6" fill="url(#brass-rivet)" />
      })}

      <g style={{
        transformOrigin: `${cx}px ${cy}px`,
        animation: cinematic ? 'none' : 'breathe 6s ease-in-out infinite',
      }}>
        <circle data-orb-core data-kingdom-id="miveritas" cx={cx} cy={cy} r={r} fill="url(#astro-mv-half-a)" />
        <path d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} L ${cx} ${cy} Z`}
          fill="url(#astro-mv-half-b)" opacity="0.95" transform={`rotate(20 ${cx} ${cy})`} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255, 248, 230, 0.55)" strokeWidth="0.7" />
        <circle cx={cx} cy={cy} r={r * 0.95} fill="none" stroke="rgba(6, 34, 45, 0.35)" strokeWidth="0.4" />
        <ellipse cx={cx - r * 0.3} cy={cy - r * 0.32} rx={r * 0.4} ry={r * 0.18} fill="rgba(255, 255, 255, 0.4)" />
      </g>

      <g transform={`translate(${cx - 22}, ${cy - 22})`} style={{ color: 'rgba(6, 34, 45, 0.75)', mixBlendMode: 'multiply' }}>
        <svg viewBox="0 0 100 100" width="44" height="44">
          <g fill="currentColor">{GLYPHS.miveritas}</g>
        </svg>
      </g>

      <text x={cx} y={cy + r + 38} textAnchor="middle"
        fontFamily="'Cormorant Garamond', serif" fontStyle="italic" fontWeight="500"
        fontSize="28" fill="#f3ecd9" opacity="0.95">Miveritas</text>
      <text x={cx} y={cy + r + 54} textAnchor="middle"
        fontFamily="'Cormorant Unicase', serif" fontSize="10" fill="url(#astro-mv-blend)" letterSpacing="4" opacity="0.92">
        ✦  TRUTH  BETWEEN  TWO  ✦
      </text>
      <text x={cx} y={cy + r + 70} textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="#c89c5a" letterSpacing="3" opacity="0.7">
        {myName.toUpperCase()} · {k.sealed}/{k.total}    {partnerName.toUpperCase()} · {k.sealedOther}/{k.total}
      </text>

      {hovered && (
        <circle cx={cx} cy={cy} r={r + 8} fill="none" stroke={k.color} strokeWidth="1" opacity="0.55">
          <animate attributeName="r" values={`${r};${r + 36}`} dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0" dur="1.8s" repeatCount="indefinite" />
        </circle>
      )}
    </g>
  )
}

function ProgressArc({ cx, cy, r, progress, color }) {
  const C = 2 * Math.PI * r
  return (
    <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="1.3"
      strokeDasharray={C} strokeDashoffset={C * (1 - progress)}
      strokeLinecap="round"
      transform={`rotate(-90 ${cx} ${cy})`}
      opacity="0.85"
      style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.22, 0.84, 0.36, 1)' }} />
  )
}

function MoonPhase({ phase = 2, onCycle }) {
  return (
    <button onClick={onCycle} title="cycle moon phase" style={{
      all: 'unset', cursor: 'pointer',
      position: 'absolute', top: '12%', left: '3.5%',
      width: 96,
      pointerEvents: 'auto',
    }}>
      <div className="smallcaps" style={{ fontSize: 10, color: 'rgba(200, 156, 90, 0.85)', letterSpacing: '0.32em', textAlign: 'center', marginBottom: 8 }}>
        ✦ this moon ✦
      </div>
      <div style={{
        position: 'relative', margin: '0 auto', width: 64, height: 64, borderRadius: '50%',
        background: '#1a1a2a',
        border: '1px solid rgba(200, 156, 90, 0.4)',
        boxShadow: '0 0 18px rgba(243, 236, 217, 0.15), inset 0 0 8px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        transition: 'all 360ms ease',
      }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'radial-gradient(circle at 32% 28%, #fef9e8 0%, #f3ecd9 60%, #d8c894 100%)',
          clipPath: moonClip(phase),
          transition: 'clip-path 480ms cubic-bezier(0.22, 0.84, 0.36, 1)',
        }} />
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'radial-gradient(circle at 28% 32%, rgba(110, 91, 50, 0.18) 0%, transparent 18%), radial-gradient(circle at 62% 56%, rgba(110, 91, 50, 0.14) 0%, transparent 12%), radial-gradient(circle at 40% 72%, rgba(110, 91, 50, 0.12) 0%, transparent 10%)',
          mixBlendMode: 'multiply', pointerEvents: 'none',
          clipPath: moonClip(phase),
        }} />
      </div>
      <div className="serif" style={{ marginTop: 8, fontSize: 14, color: 'rgba(247, 236, 207, 0.92)', textAlign: 'center', lineHeight: 1.25, fontWeight: 500 }}>
        {MOON_NAMES[phase]}
      </div>
      <div className="mono" style={{ fontSize: 9, color: 'rgba(200, 156, 90, 0.8)', letterSpacing: '0.22em', textAlign: 'center', marginTop: 3 }}>
        NIGHT {(phase * 4 + 1).toString().padStart(2, '0')}
      </div>
    </button>
  )
}

function BrassDial({ side, label, value, setValue, min = 0, max = 12, display, subDisplay }) {
  const [dragging, setDragging] = useState(false)
  const range = max - min
  const pct = (value - min) / range

  function pickFromY(clientY, trackEl) {
    if (!trackEl) return
    const r = trackEl.getBoundingClientRect()
    const t = 1 - Math.max(0, Math.min(1, (clientY - r.top) / r.height))
    setValue(Math.round(min + t * range))
  }

  return (
    <div style={{
      position: 'absolute', top: '50%', [side]: 20,
      transform: 'translateY(-50%)',
      width: 56, height: 280,
      pointerEvents: 'auto',
      background: 'linear-gradient(90deg, rgba(200, 156, 90, 0.18), rgba(200, 156, 90, 0.05))',
      border: '1px solid rgba(200, 156, 90, 0.28)',
      borderRadius: 6,
      padding: '10px 8px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
      zIndex: 60,
    }}>
      <div style={{
        width: 36, height: 28, borderRadius: 4,
        background: 'rgba(7, 9, 30, 0.6)',
        border: '1px solid rgba(200, 156, 90, 0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Cormorant Unicase', serif", fontSize: 13, color: 'rgba(247, 236, 207, 0.95)',
      }}>{display}</div>

      <div
        onPointerDown={(e) => {
          const track = e.currentTarget
          setDragging(true)
          pickFromY(e.clientY, track)
          function onMove(ev) { pickFromY(ev.clientY, track) }
          function onUp() {
            setDragging(false)
            window.removeEventListener('pointermove', onMove)
            window.removeEventListener('pointerup', onUp)
          }
          window.addEventListener('pointermove', onMove)
          window.addEventListener('pointerup', onUp)
        }}
        style={{
          position: 'relative', flex: 1, width: 14, cursor: 'ns-resize',
          margin: '10px 0', display: 'flex', justifyContent: 'center',
          touchAction: 'none',
        }}>
        <div style={{ width: 2, height: '100%', background: 'linear-gradient(180deg, rgba(200, 156, 90, 0.45), rgba(200, 156, 90, 0.15))', borderRadius: 2 }} />
        {Array.from({ length: range + 1 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: `${(1 - i / range) * 100}%`,
            left: '50%', marginLeft: -3, width: 6, height: 1,
            background: 'rgba(200, 156, 90, 0.4)',
          }} />
        ))}
        <div style={{
          position: 'absolute', top: `${(1 - pct) * 100}%`,
          left: '50%', marginLeft: -10, marginTop: -10,
          width: 20, height: 20, borderRadius: '50%',
          background: 'radial-gradient(circle at 38% 32%, #fde4a0, #c89c5a 50%, #5a4218 100%)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 0 12px rgba(200, 156, 90, 0.4)',
          transition: dragging ? 'none' : 'top 240ms cubic-bezier(0.22, 0.84, 0.36, 1)',
        }} />
      </div>

      <div className="mono" style={{
        fontSize: 7, color: 'rgba(200, 156, 90, 0.8)', letterSpacing: '0.22em',
        textAlign: 'center', marginBottom: 4, minHeight: 10,
      }}>{subDisplay}</div>

      <div className="mono" style={{
        fontSize: 8, color: 'rgba(200, 156, 90, 0.75)', letterSpacing: '0.28em',
      }}>{label}</div>
    </div>
  )
}

function DayLedger({ day, entries }) {
  return (
    <div style={{
      position: 'absolute', right: 90, top: '50%',
      transform: 'translateY(-50%)',
      width: 240, zIndex: 55,
      padding: '12px 14px',
      background: 'linear-gradient(180deg, rgba(40, 32, 18, 0.78), rgba(20, 16, 8, 0.82))',
      border: '1px solid rgba(200, 156, 90, 0.32)',
      borderRadius: 4,
      pointerEvents: 'none',
      backdropFilter: 'blur(8px)',
    }}>
      {['tl', 'tr', 'bl', 'br'].map(p => {
        const [v, h] = p.split('')
        return <div key={p} style={{
          position: 'absolute',
          [v === 't' ? 'top' : 'bottom']: -1,
          [h === 'l' ? 'left' : 'right']: -1,
          width: 8, height: 8,
          [`border${v === 't' ? 'Top' : 'Bottom'}`]: '1px solid #c89c5a',
          [`border${h === 'l' ? 'Left' : 'Right'}`]: '1px solid #c89c5a',
        }} />
      })}
      <div className="smallcaps" style={{ fontSize: 9, color: 'rgba(200, 156, 90, 0.75)', letterSpacing: '0.32em', marginBottom: 8 }}>
        ✦  ledger of {day}  ✦
      </div>
      {entries.length === 0 ? (
        <div className="serif" style={{ fontSize: 12, fontStyle: 'italic', color: 'rgba(243, 236, 217, 0.5)', lineHeight: 1.4 }}>
          no deeds sealed on this day.<br />
          <span style={{ color: 'rgba(200, 156, 90, 0.55)' }}>turn the wheel.</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {entries.map((e, i) => {
            const kc = KINGDOMS.find(k => k.id === e.kingdom)
            return (
              <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', lineHeight: 1.35 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: kc?.color || '#fde4a0', marginTop: 5, flexShrink: 0,
                  boxShadow: `0 0 6px ${kc?.color || '#fde4a0'}66`,
                }} />
                <div style={{ minWidth: 0 }}>
                  <div className="serif" style={{ fontSize: 12.5, fontStyle: 'italic', color: 'rgba(247, 236, 207, 0.92)' }}>
                    {e.title}
                  </div>
                  <div className="mono" style={{ fontSize: 7, marginTop: 2, letterSpacing: '0.2em', color: 'rgba(200, 156, 90, 0.55)' }}>
                    {e.who.toUpperCase()}  ·  {kc?.serif?.toUpperCase()}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function AstroCompanionsRibbon() {
  const user = useAppStore((s) => s.user)
  const partner = useAppStore((s) => s.partner)
  const navigate = useNavigate()

  const myName = user?.display_name || '—'
  const partnerName = partner?.display_name || null

  return (
    <div style={{
      position: 'absolute', left: '50%', bottom: '4.5%',
      transform: 'translateX(-50%)',
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '10px 22px 10px 12px',
      background: 'linear-gradient(180deg, rgba(40, 32, 18, 0.65), rgba(20, 16, 8, 0.55))',
      border: '1px solid rgba(200, 156, 90, 0.3)',
      borderRadius: 999,
      pointerEvents: 'none',
      backdropFilter: 'blur(10px)',
      whiteSpace: 'nowrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', pointerEvents: 'auto' }}>
        {/* My avatar — highlighted with a ring */}
        <BrassAvatar color="#ecc36a" glyph="moth" online isMe />
        {/* Partner avatar — clickable */}
        {partnerName && (
          <BrassAvatar
            color="#b8a8e4" glyph="spiral" offset online
            onClick={() => navigate('/partner')}
            title={`View ${partnerName}'s map`}
          />
        )}
      </div>
      <div>
        <div className="serif" style={{ fontSize: 14, fontStyle: 'italic', color: 'rgba(243, 236, 217, 0.92)', lineHeight: 1 }}>
          <span style={{ color: 'rgba(253, 228, 160, 0.95)' }}>{myName}</span>
          {partnerName && (
            <>
              {' '}<span style={{ color: 'rgba(200, 156, 90, 0.7)' }}>·</span>{' '}
              <button
                onClick={() => navigate('/partner')}
                style={{
                  all: 'unset', cursor: 'pointer',
                  color: 'rgba(243, 236, 217, 0.75)',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 14, fontStyle: 'italic',
                  textDecoration: 'underline', textDecorationColor: 'rgba(184, 168, 228, 0.45)',
                }}
              >
                {partnerName}
              </button>
            </>
          )}
        </div>
        <div className="mono" style={{ fontSize: 7.5, color: 'rgba(200, 156, 90, 0.8)', letterSpacing: '0.22em', marginTop: 3 }}>
          {partnerName
            ? `✦  ${myName.toUpperCase()} · ${partnerName.toUpperCase()} · COMPANIONS`
            : `✦  AWAITING COMPANION  ✦`}
        </div>
      </div>
    </div>
  )
}

function BrassAvatar({ color, glyph, offset, online, isMe, onClick, title }) {
  const inner = (
    <div style={{
      position: 'relative', width: 32, height: 32, borderRadius: '50%',
      marginLeft: offset ? -10 : 0,
      background: `radial-gradient(circle at 35% 30%, ${lighten(color, 0.35)}, ${color} 55%, ${darken(color, 0.3)})`,
      border: isMe ? '2px solid #fde4a0' : '1.5px solid #c89c5a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: isMe
        ? `0 0 12px ${color}88, 0 0 0 2px rgba(253, 228, 160, 0.35)`
        : online ? `0 0 10px ${color}66` : '0 0 0 1px rgba(200, 156, 90, 0.3)',
      color: darken(color, 0.5),
      opacity: online ? 1 : 0.55,
      filter: online ? undefined : 'saturate(0.4)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'box-shadow 200ms ease',
    }}>
      <svg viewBox="0 0 100 100" width="14" height="14">
        <g fill="currentColor" opacity="0.85">{GLYPHS[glyph]}</g>
      </svg>
    </div>
  )
  if (onClick) {
    return (
      <button onClick={onClick} title={title} style={{ all: 'unset' }}>
        {inner}
      </button>
    )
  }
  return inner
}

function InviteCodeWidget({ code }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  return (
    <button
      onClick={handleCopy}
      title="Click to copy invite code"
      style={{
        all: 'unset',
        cursor: 'pointer',
        position: 'absolute',
        right: 22,
        bottom: '8%',
        pointerEvents: 'auto',
        padding: '10px 18px',
        background: 'linear-gradient(180deg, rgba(40, 32, 18, 0.72), rgba(20, 16, 8, 0.65))',
        border: '1px solid rgba(200, 156, 90, 0.32)',
        borderRadius: 4,
        backdropFilter: 'blur(10px)',
        textAlign: 'center',
        transition: 'border-color 240ms ease',
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(200, 156, 90, 0.6)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(200, 156, 90, 0.32)'}
    >
      {['tl', 'tr', 'bl', 'br'].map(p => {
        const [v, h] = p.split('')
        return <div key={p} style={{
          position: 'absolute',
          [v === 't' ? 'top' : 'bottom']: -1,
          [h === 'l' ? 'left' : 'right']: -1,
          width: 8, height: 8,
          [`border${v === 't' ? 'Top' : 'Bottom'}`]: '1px solid #c89c5a',
          [`border${h === 'l' ? 'Left' : 'Right'}`]: '1px solid #c89c5a',
        }} />
      })}
      <div className="smallcaps" style={{
        fontSize: 8, letterSpacing: '0.34em',
        color: 'rgba(200, 156, 90, 0.65)',
        marginBottom: 6,
      }}>
        ✦  your portal key  ✦
      </div>
      <div className="mono" style={{
        fontSize: 16, letterSpacing: '0.28em',
        color: 'rgba(253, 228, 160, 0.92)',
      }}>
        {code}
      </div>
      <div className="mono" style={{
        marginTop: 6, fontSize: 8, letterSpacing: '0.22em',
        color: copied ? 'rgba(158, 212, 181, 0.9)' : 'rgba(200, 156, 90, 0.45)',
        transition: 'color 220ms ease',
      }}>
        {copied ? 'COPIED ✦' : 'CLICK TO COPY'}
      </div>
    </button>
  )
}

function AstroTooltip({ kingdom }) {
  if (!kingdom) return null
  return (
    <div className="astro-tooltip" style={{
      position: 'absolute', left: '50%', bottom: '14%',
      transform: 'translateX(-50%)',
      width: 'min(420px, 86vw)', padding: '14px 24px',
      background: 'linear-gradient(180deg, rgba(40, 32, 18, 0.88), rgba(20, 16, 8, 0.85))',
      border: '1px solid rgba(200, 156, 90, 0.4)',
      borderRadius: 4,
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 32px rgba(200, 156, 90, 0.12)',
      pointerEvents: 'none', textAlign: 'center',
      animation: 'tooltip-rise 240ms cubic-bezier(0.22, 0.84, 0.36, 1) forwards',
      zIndex: 50,
    }}>
      <div style={{ position: 'absolute', top: -1, left: -1, width: 14, height: 14, borderTop: '1px solid #c89c5a', borderLeft: '1px solid #c89c5a' }} />
      <div style={{ position: 'absolute', top: -1, right: -1, width: 14, height: 14, borderTop: '1px solid #c89c5a', borderRight: '1px solid #c89c5a' }} />
      <div style={{ position: 'absolute', bottom: -1, left: -1, width: 14, height: 14, borderBottom: '1px solid #c89c5a', borderLeft: '1px solid #c89c5a' }} />
      <div style={{ position: 'absolute', bottom: -1, right: -1, width: 14, height: 14, borderBottom: '1px solid #c89c5a', borderRight: '1px solid #c89c5a' }} />

      <div className="smallcaps" style={{ fontSize: 9, color: 'rgba(200, 156, 90, 0.8)', letterSpacing: '0.32em' }}>
        ✦  {kingdom.verb}  ✦
      </div>
      <div className="serif" style={{ fontStyle: 'italic', fontSize: 28, marginTop: 6, color: 'rgba(247, 236, 207, 0.95)', lineHeight: 1 }}>
        {kingdom.serif}
      </div>
      <div className="serif" style={{ marginTop: 10, fontStyle: 'italic', fontSize: 14, color: 'rgba(243, 236, 217, 0.78)', lineHeight: 1.55 }}>
        “{kingdom.proverb}”
      </div>
      <div className="mono" style={{ fontSize: 8, marginTop: 10, color: 'rgba(200, 156, 90, 0.65)', letterSpacing: '0.26em' }}>
        {kingdom.dual
          ? `${kingdom.sealed}/${kingdom.total}  ·  ${kingdom.sealedOther}/${kingdom.total}  ·  CLICK TO ENTER`
          : `${kingdom.sealed}/${kingdom.total}  SEALED  ·  CLICK TO ENTER`}
      </div>
    </div>
  )
}
