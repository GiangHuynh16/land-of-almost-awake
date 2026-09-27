import { useEffect, useRef, useState } from 'react'
import { GLYPHS } from '../glyphs.jsx'
import { darken, lighten } from '../colors.js'
import { SealSlot } from '../SealSlot.jsx'
import { stampsFor } from '../data.js'

export function ViewToggle({ view, setView, kingdom, isMiveritas }) {
  const items = [
    { id: 'starlog', label: 'star-log' },
    { id: 'tarot', label: 'tarot' },
  ]
  const accent = isMiveritas ? '#7adfe2' : kingdom.color
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center',
      background: 'rgba(7, 9, 30, 0.55)',
      border: '1px solid rgba(200, 156, 90, 0.3)',
      borderRadius: 999, padding: 3,
      backdropFilter: 'blur(10px)',
    }}>
      {items.map(it => (
        <button key={it.id}
          onClick={() => setView(it.id)}
          style={{
            all: 'unset', cursor: 'pointer',
            padding: '8px 18px', borderRadius: 999,
            fontFamily: "'Cormorant Garamond', serif", fontSize: 15,
            fontWeight: view === it.id ? 500 : 400,
            color: view === it.id ? '#0c0f24' : 'rgba(243, 236, 217, 0.82)',
            background: view === it.id
              ? `linear-gradient(180deg, ${lighten(accent, 0.15)}, ${accent})`
              : 'transparent',
            transition: 'all 220ms ease',
            whiteSpace: 'nowrap',
          }}>{it.label}</button>
      ))}
    </div>
  )
}

export function PerspectiveToggle({ perspective, setPerspective, myName = 'me', partnerName = 'partner' }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: 'rgba(7, 9, 30, 0.55)', border: '1px solid rgba(200, 156, 90, 0.3)',
      borderRadius: 999, padding: 3,
      backdropFilter: 'blur(10px)',
    }}>
      {[
        { id: 'me', color: 'var(--k-veritas-a)', label: myName },
        { id: 'partner', color: 'var(--k-veritas-b)', label: partnerName },
      ].map(p => (
        <button key={p.id} onClick={() => setPerspective(p.id)} style={{
          all: 'unset', cursor: 'pointer',
          padding: '6px 14px 6px 8px', borderRadius: 999,
          display: 'inline-flex', alignItems: 'center', gap: 7,
          fontFamily: "'Cormorant Garamond', serif", fontSize: 14,
          color: perspective === p.id ? 'var(--ink)' : 'rgba(243, 236, 217, 0.6)',
          background: perspective === p.id ? 'rgba(200, 156, 90, 0.18)' : 'transparent',
          transition: 'all 200ms ease',
        }}>
          <span style={{
            width: 16, height: 16, borderRadius: '50%',
            background: p.color,
            boxShadow: perspective === p.id ? `0 0 8px ${p.color}` : 'none',
          }} />
          <span style={{ fontStyle: 'italic' }}>{p.label}</span>
        </button>
      ))}
    </div>
  )
}

export function SectionDivider({ label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8,
      color: 'rgba(200, 156, 90, 0.7)',
    }}>
      <div className="smallcaps" style={{ fontSize: 9, letterSpacing: '0.32em' }}>✦ {label}</div>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(200, 156, 90, 0.3), transparent)' }} />
    </div>
  )
}

export function Starlog({ deeds, kingdom, onSeal, onUnseal }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <SectionDivider label="this week" />
      {deeds.map((d, i) => (
        <DeedRow key={d.id} deed={d} kingdom={kingdom} index={i}
          onSeal={(g) => onSeal(kingdom.id, d.id, g)}
          onUnseal={() => onUnseal && onUnseal(kingdom.id, d.id)} />
      ))}
    </div>
  )
}

function DeedRow({ deed, kingdom, index, onSeal, onUnseal }) {
  const isSealed = !!deed.sealed
  const c = kingdom.color
  const [pressing, setPressing] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const longPressTimer = useRef(null)

  function startPress() {
    if (!isSealed) return
    setPressing(true)
    longPressTimer.current = setTimeout(() => {
      setPressing(false)
      setConfirm(true)
    }, 650)
  }
  function endPress() {
    setPressing(false)
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }
  function doUnseal() {
    onUnseal && onUnseal()
    setConfirm(false)
  }

  return (
    <div style={{
      position: 'relative',
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
      alignItems: 'center', gap: 18,
      padding: '14px 4px 14px 0',
      borderBottom: '1px dashed rgba(200, 156, 90, 0.14)',
      animation: `stagger-in 480ms ease-out ${80 + index * 50}ms backwards`,
    }}>
      <ConstellationDot index={index} color={c} sealed={isSealed} />

      <div onPointerDown={startPress} onPointerUp={endPress} onPointerLeave={endPress} onPointerCancel={endPress}
        style={{ minWidth: 0, cursor: isSealed ? 'pointer' : 'default', userSelect: 'none', position: 'relative' }}>
        <div className="serif" style={{
          fontSize: 18, lineHeight: 1.3, fontStyle: 'italic',
          color: isSealed ? 'rgba(243, 236, 217, 0.55)' : 'var(--ink)',
        }}>
          {deed.title}
        </div>
        {deed.note && (
          <div className="serif" style={{
            fontSize: 13, fontStyle: 'italic', marginTop: 4,
            color: isSealed ? 'rgba(243, 236, 217, 0.35)' : 'rgba(243, 236, 217, 0.6)',
            lineHeight: 1.4,
          }}>{deed.note}</div>
        )}
        <div className="mono" style={{
          fontSize: 8, marginTop: 6, letterSpacing: '0.22em',
          color: isSealed ? 'rgba(200, 156, 90, 0.45)' : 'rgba(200, 156, 90, 0.6)',
        }}>
          {deed.who.toUpperCase()} · {deed.when}{isSealed && ' · HOLD TO UNSEAL'}
        </div>
        {pressing && (
          <div style={{
            position: 'absolute', left: 42, right: 80, bottom: 4, height: 2,
            background: 'rgba(200, 156, 90, 0.18)', borderRadius: 2, overflow: 'hidden',
          }}>
            <div style={{
              width: '100%', height: '100%',
              background: `linear-gradient(90deg, ${c}, ${darken(c, 0.2)})`,
              transformOrigin: 'left',
              animation: 'longpress-fill 650ms linear forwards',
            }} />
          </div>
        )}
      </div>

      <div style={{ flexShrink: 0 }}>
        <SealSlot
          size={56}
          color={c}
          state={isSealed ? 'sealed' : 'empty'}
          chosen={deed.glyph}
          onSeal={onSeal}
          pickerStamps={stampsFor(kingdom.id)}
          label={!isSealed ? 'press' : undefined} />
      </div>

      {confirm && (
        <UnsealConfirm onConfirm={doUnseal} onCancel={() => setConfirm(false)} color={c} deed={deed} />
      )}
    </div>
  )
}

function UnsealConfirm({ onConfirm, onCancel, color, deed }) {
  return (
    <div style={{
      position: 'absolute', inset: -8,
      background: 'rgba(7, 9, 30, 0.85)', backdropFilter: 'blur(6px)',
      border: `1px solid ${color}66`, borderRadius: 6,
      padding: '12px 18px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
      zIndex: 10, animation: 'stagger-in 220ms ease-out backwards',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="serif" style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.3 }}>
          unseal “{deed.title}”?
        </div>
        <div className="mono" style={{ fontSize: 7.5, marginTop: 4, color: 'rgba(200, 156, 90, 0.6)', letterSpacing: '0.22em' }}>
          THE GESTURE WILL BE FORGOTTEN
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button onClick={onCancel} style={{
          all: 'unset', cursor: 'pointer', padding: '6px 12px', borderRadius: 999,
          border: '1px solid rgba(200, 156, 90, 0.3)',
          fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 12,
          color: 'rgba(243, 236, 217, 0.7)',
        }}>keep it</button>
        <button onClick={onConfirm} style={{
          all: 'unset', cursor: 'pointer', padding: '6px 12px', borderRadius: 999,
          background: `linear-gradient(180deg, ${lighten(color, 0.15)}, ${color})`,
          fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 12,
          color: '#0c0f24',
        }}>unseal</button>
      </div>
    </div>
  )
}

function ConstellationDot({ index, color, sealed }) {
  const patterns = [
    [[0, 0]],
    [[0, 0], [10, 8]],
    [[0, 0], [12, 6], [6, 14]],
    [[0, 0], [14, 4], [8, 12], [16, 16]],
    [[0, 4], [10, 0], [16, 8], [6, 12], [18, 16]],
  ]
  const p = patterns[index % patterns.length]
  return (
    <div style={{ width: 24, height: 24, opacity: sealed ? 0.4 : 0.9 }}>
      <svg viewBox="0 0 22 22" width="100%" height="100%">
        {p.slice(0, -1).map((pt, i) => (
          <line key={i} x1={pt[0] + 1} y1={pt[1] + 3} x2={p[i + 1][0] + 1} y2={p[i + 1][1] + 3}
            stroke={color} strokeWidth="0.5" opacity="0.55" />
        ))}
        {p.map(([x, y], i) => (
          <circle key={i} cx={x + 1} cy={y + 3} r="1.4" fill={color} opacity="0.92" />
        ))}
      </svg>
    </div>
  )
}

export function Tarot({ deeds, kingdom, onSeal, onUnseal }) {
  return (
    <div className="k-tarot" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: 18, paddingBottom: 8,
    }}>
      {deeds.map((d, i) => (
        <TarotCard key={d.id} deed={d} kingdom={kingdom} index={i}
          onSeal={(g) => onSeal(kingdom.id, d.id, g)}
          onUnseal={() => onUnseal && onUnseal(kingdom.id, d.id)} />
      ))}
    </div>
  )
}

function TarotCard({ deed, kingdom, index, onSeal }) {
  const isSealed = !!deed.sealed
  const c = kingdom.color
  const rot = ((index * 31) % 5) - 2
  return (
    <div style={{
      position: 'relative',
      transform: `rotate(${rot}deg)`,
      transformOrigin: 'center',
      animation: `stagger-in 460ms ease-out ${100 + index * 60}ms backwards`,
    }}>
      <div style={{
        position: 'relative',
        background: `linear-gradient(180deg, rgba(11, 18, 50, 0.85), rgba(7, 9, 30, 0.9)), radial-gradient(ellipse at 50% 0%, ${c}30 0%, transparent 60%)`,
        border: '1px solid rgba(200, 156, 90, 0.35)',
        borderRadius: 4,
        padding: '16px 14px 14px',
        aspectRatio: '5 / 7',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 14px 30px rgba(0, 0, 0, 0.5), inset 0 0 30px rgba(200, 156, 90, 0.06)',
        color: 'var(--ink)',
      }}>
        <div className="mono" style={{
          position: 'absolute', top: 8, left: 10, fontSize: 8,
          color: 'rgba(200, 156, 90, 0.6)', letterSpacing: '0.2em',
        }}>{toRoman(index + 1)}</div>
        <div className="mono" style={{
          position: 'absolute', top: 8, right: 10, fontSize: 8,
          color: 'rgba(200, 156, 90, 0.6)', letterSpacing: '0.2em',
        }}>{toRoman(index + 1)}</div>

        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: c, opacity: 0.16, pointerEvents: 'none',
        }}>
          <svg viewBox="0 0 100 100" width="70%" height="70%">
            <g fill="currentColor">{GLYPHS[kingdom.id]}</g>
          </svg>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
          <div className="serif" style={{
            fontSize: 14, fontStyle: 'italic', lineHeight: 1.3,
            color: isSealed ? 'rgba(243, 236, 217, 0.55)' : 'var(--ink)',
            position: 'relative',
          }}>
            {deed.title}
            {deed.note && (
              <div className="serif" style={{
                fontSize: 11, fontStyle: 'italic', marginTop: 4,
                color: 'rgba(243, 236, 217, 0.55)', lineHeight: 1.4,
              }}>{deed.note}</div>
            )}
          </div>
        </div>

        <div style={{
          marginTop: 10, paddingTop: 10,
          borderTop: '1px dashed rgba(200, 156, 90, 0.2)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        }}>
          <div className="mono" style={{
            fontSize: 7.5, letterSpacing: '0.2em', color: 'rgba(200, 156, 90, 0.6)',
            lineHeight: 1.4, maxWidth: 70,
          }}>
            {deed.who.toUpperCase()}<br />{deed.when.split(' · ')[0]}
          </div>
          <div style={{ position: 'relative', zIndex: 3 }}>
            <SealSlot
              size={50}
              color={c}
              state={isSealed ? 'sealed' : 'empty'}
              chosen={deed.glyph}
              onSeal={onSeal}
              pickerStamps={stampsFor(kingdom.id)} />
          </div>
        </div>
      </div>
    </div>
  )
}

function toRoman(n) {
  const map = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV']
  return map[n - 1] || String(n)
}

export function MiveritasStarlog({ deeds, perspective, onSeal, myName = 'me', partnerName = 'partner' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <SectionDivider label="joint promises" />
      {deeds.map((d, i) => (
        <MiveritasRow key={d.id} deed={d} index={i} perspective={perspective}
          myName={myName} partnerName={partnerName}
          onSeal={(who, g) => onSeal('miveritas', d.id, who, g)} />
      ))}
    </div>
  )
}

function MiveritasRow({ deed, index, perspective, onSeal, myName = 'me', partnerName = 'partner' }) {
  const sealedElsa = deed.sealedBy?.me ?? deed.sealedBy?.elsa
  const sealedGranny = deed.sealedBy?.partner ?? deed.sealedBy?.granny
  const both = sealedElsa && sealedGranny
  const half = (sealedElsa && !sealedGranny) || (!sealedElsa && sealedGranny)
  const [merge, setMerge] = useState(false)
  const prevBoth = useRef(both)

  useEffect(() => {
    if (both && !prevBoth.current) {
      setMerge(true)
      const t = setTimeout(() => setMerge(false), 1400)
      return () => clearTimeout(t)
    }
    prevBoth.current = both
  }, [both])

  const focused = !both && (perspective === 'me' ? !sealedElsa : !sealedGranny)

  return (
    <div style={{
      position: 'relative',
      display: 'grid',
      gridTemplateColumns: '64px 1fr 64px',
      alignItems: 'center', gap: 16,
      padding: '16px 4px',
      borderBottom: '1px dashed rgba(200, 156, 90, 0.14)',
      animation: `stagger-in 480ms ease-out ${80 + index * 50}ms backwards`,
    }}>
      {focused && (
        <div style={{
          position: 'absolute', inset: '4px 0', borderRadius: 4,
          background: perspective === 'me'
            ? 'linear-gradient(90deg, rgba(122, 223, 226, 0.10), transparent 70%)'
            : 'linear-gradient(-90deg, rgba(228, 137, 200, 0.10), transparent 70%)',
          pointerEvents: 'none',
        }} />
      )}

      <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
        <SealSlot
          size={56}
          color="#7adfe2"
          state={sealedElsa ? 'sealed' : (half && !sealedElsa ? 'waiting' : 'empty')}
          chosen={sealedElsa?.glyph}
          onSeal={(g) => onSeal('me', g)}
          pickerStamps={stampsFor('miveritas')}
          label={!sealedElsa ? myName.toLowerCase() : undefined} />
      </div>

      <div>
        <div className="serif" style={{
          fontSize: 17, lineHeight: 1.35, fontStyle: 'italic',
          color: both ? 'rgba(243, 236, 217, 0.55)' : 'var(--ink)',
        }}>{deed.title}</div>
        {deed.note && (
          <div className="serif" style={{
            fontSize: 12.5, fontStyle: 'italic', marginTop: 4,
            color: 'rgba(243, 236, 217, 0.55)', lineHeight: 1.4,
          }}>{deed.note}</div>
        )}
        <div className="mono" style={{
          fontSize: 8, marginTop: 6, letterSpacing: '0.22em',
          color: both
            ? 'rgba(122, 223, 226, 0.55)'
            : half
              ? 'rgba(243, 236, 217, 0.45)'
              : 'rgba(200, 156, 90, 0.55)',
        }}>
          {both
            ? '✦ SEALED BY BOTH'
            : half
              ? `WAITING FOR ${sealedElsa ? partnerName.toUpperCase() : myName.toUpperCase()}`
              : 'AWAITING BOTH SEALS'}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
        <SealSlot
          size={56}
          color="#e489c8"
          state={sealedGranny ? 'sealed' : (half && !sealedGranny ? 'waiting' : 'empty')}
          chosen={sealedGranny?.glyph}
          onSeal={(g) => onSeal('partner', g)}
          pickerStamps={stampsFor('miveritas')}
          label={!sealedGranny ? partnerName.toLowerCase() : undefined} />
      </div>

      {merge && (
        <>
          <div style={{
            position: 'absolute', left: '50%', top: '50%',
            width: 100, height: 100,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(253, 243, 217, 0.95) 0%, rgba(122, 223, 226, 0.4) 40%, transparent 80%)',
            animation: 'seal-merge 1.2s cubic-bezier(0.22, 0.84, 0.36, 1) forwards',
            mixBlendMode: 'screen', pointerEvents: 'none',
          }} />
        </>
      )}
    </div>
  )
}

export function MiveritasTarot({ deeds, perspective, onSeal, myName = 'me', partnerName = 'partner' }) {
  return (
    <div className="k-tarot" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: 18, paddingBottom: 8,
    }}>
      {deeds.map((d, i) => (
        <MiveritasTarotCard key={d.id} deed={d} index={i} perspective={perspective}
          myName={myName} partnerName={partnerName}
          onSeal={(who, g) => onSeal('miveritas', d.id, who, g)} />
      ))}
    </div>
  )
}

function MiveritasTarotCard({ deed, index, onSeal, myName = 'me', partnerName = 'partner' }) {
  const sealedElsa = deed.sealedBy?.me ?? deed.sealedBy?.elsa
  const sealedGranny = deed.sealedBy?.partner ?? deed.sealedBy?.granny
  const both = sealedElsa && sealedGranny
  const rot = ((index * 31) % 5) - 2
  return (
    <div style={{
      position: 'relative',
      transform: `rotate(${rot}deg)`,
      animation: `stagger-in 460ms ease-out ${100 + index * 60}ms backwards`,
    }}>
      <div style={{
        position: 'relative',
        background: 'linear-gradient(180deg, rgba(11, 18, 50, 0.85), rgba(7, 9, 30, 0.9)), radial-gradient(ellipse at 30% 0%, rgba(122, 223, 226, 0.3) 0%, transparent 55%), radial-gradient(ellipse at 70% 0%, rgba(228, 137, 200, 0.3) 0%, transparent 55%)',
        border: '1px solid rgba(200, 156, 90, 0.35)',
        borderRadius: 4,
        padding: '16px 14px 14px',
        aspectRatio: '5 / 7',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 14px 30px rgba(0, 0, 0, 0.5)',
      }}>
        <div className="mono" style={{
          position: 'absolute', top: 8, left: 10, fontSize: 8,
          color: 'rgba(200, 156, 90, 0.6)', letterSpacing: '0.2em',
        }}>{toRoman(index + 1)}</div>
        <div className="mono" style={{
          position: 'absolute', top: 8, right: 10, fontSize: 8,
          color: 'rgba(200, 156, 90, 0.6)', letterSpacing: '0.2em',
        }}>{toRoman(index + 1)}</div>

        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: 'rgba(122, 223, 226, 0.18)', pointerEvents: 'none',
        }}>
          <svg viewBox="0 0 100 100" width="60%" height="60%">
            <g fill="currentColor">{GLYPHS.miveritas}</g>
          </svg>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
          <div className="serif" style={{
            fontSize: 14, fontStyle: 'italic', lineHeight: 1.3,
            color: both ? 'rgba(243, 236, 217, 0.55)' : 'var(--ink)',
            position: 'relative',
          }}>
            {deed.title}
            {deed.note && (
              <div style={{ fontSize: 11, marginTop: 4, color: 'rgba(243, 236, 217, 0.5)', lineHeight: 1.4 }}>
                {deed.note}
              </div>
            )}
          </div>
        </div>

        <div style={{
          marginTop: 10, paddingTop: 10,
          borderTop: '1px dashed rgba(200, 156, 90, 0.2)',
          display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        }}>
          <div style={{ textAlign: 'center' }}>
            <SealSlot size={42} color="#7adfe2"
              state={sealedElsa ? 'sealed' : 'empty'}
              chosen={sealedElsa?.glyph}
              onSeal={(g) => onSeal('me', g)}
              pickerStamps={stampsFor('miveritas')} />
            <div className="mono" style={{ fontSize: 7, color: 'rgba(200, 156, 90, 0.6)', letterSpacing: '0.2em', marginTop: 8 }}>{myName.toUpperCase()}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <SealSlot size={42} color="#e489c8"
              state={sealedGranny ? 'sealed' : 'empty'}
              chosen={sealedGranny?.glyph}
              onSeal={(g) => onSeal('partner', g)}
              pickerStamps={stampsFor('miveritas')} />
            <div className="mono" style={{ fontSize: 7, color: 'rgba(200, 156, 90, 0.6)', letterSpacing: '0.2em', marginTop: 8 }}>{partnerName.toUpperCase()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
