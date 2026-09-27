import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Aurora, BrassDefs, Motes, NebulaBackdrop, Stars } from '../atmosphere.jsx'
import { darken } from '../colors.js'
import { DEEDS_BY_KINGDOM, KINGDOMS, MIVERITAS_DEEDS, placeholderFor } from '../data.js'
import { RotatingPlanet } from './RotatingPlanet.jsx'
import { useAppStore } from '../../store/useAppStore.js'
import {
  MiveritasStarlog,
  MiveritasTarot,
  PerspectiveToggle,
  Starlog,
  Tarot,
  ViewToggle,
} from './views.jsx'

export default function KingdomDetail({ kingdomId: kingdomIdProp, onBack }) {
  const params = useParams()
  const navigate = useNavigate()
  const id = kingdomIdProp || params.id
  const kingdom = KINGDOMS.find(x => x.id === id)
  const isMiveritas = id === 'miveritas'

  const storeUser = useAppStore((s) => s.user)
  const storePartner = useAppStore((s) => s.partner)
  const myName = storeUser?.display_name || 'me'
  const partnerName = storePartner?.display_name || 'partner'

  const handleBack = onBack || (() => navigate('/'))

  const [view, setView] = useState('starlog')
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')
  const [draftNote, setDraftNote] = useState('')
  const [showNote, setShowNote] = useState(false)
  const [who, setWho] = useState(myName)
  const [perspective, setPerspective] = useState('me')

  const [deedsByK, setDeedsByK] = useState(() => {
    const copy = {}
    for (const k of Object.keys(DEEDS_BY_KINGDOM)) {
      copy[k] = DEEDS_BY_KINGDOM[k].map(d => ({ ...d }))
    }
    return copy
  })
  const [veritasDeeds, setVeritasDeeds] = useState(() =>
    MIVERITAS_DEEDS.map(d => ({ ...d, sealedBy: { ...d.sealedBy } })))

  if (!kingdom) {
    return (
      <div style={{ padding: 40, color: 'var(--ink)' }}>
        Unknown kingdom. <button onClick={() => navigate('/')}>← back</button>
      </div>
    )
  }

  const deeds = isMiveritas ? veritasDeeds : (deedsByK[id] || [])

  function sealDeed(kingdomId, deedId, glyph) {
    setDeedsByK(prev => ({
      ...prev,
      [kingdomId]: prev[kingdomId].map(d => d.id === deedId ? { ...d, sealed: true, glyph } : d),
    }))
  }

  function unsealDeed(kingdomId, deedId) {
    setDeedsByK(prev => ({
      ...prev,
      [kingdomId]: prev[kingdomId].map(d => d.id === deedId ? { ...d, sealed: false, glyph: undefined } : d),
    }))
  }

  function sealVeritas(_kingdomId, deedId, whoVal, glyph) {
    setVeritasDeeds(prev => prev.map(d => d.id === deedId
      ? { ...d, sealedBy: { ...(d.sealedBy || {}), [whoVal]: { glyph, at: 'NOW' } } }
      : d))
  }

  function addDeed() {
    const v = draft.trim()
    if (!v) return
    const newId = `n-${Date.now()}`
    const note = draftNote.trim() || undefined
    if (isMiveritas) {
      setVeritasDeeds(prev => [{ id: newId, title: v, note, sealedBy: {} }, ...prev])
    } else {
      setDeedsByK(prev => ({
        ...prev,
        [id]: [{ id: newId, title: v, note, who, when: 'NOW', sealed: false }, ...prev[id]],
      }))
    }
    setDraft('')
    setDraftNote('')
    setShowNote(false)
    setAdding(false)
  }

  const surfaceGlow = isMiveritas
    ? 'radial-gradient(ellipse at 30% 0%, rgba(122, 223, 226, 0.18) 0%, transparent 55%), radial-gradient(ellipse at 70% 30%, rgba(228, 137, 200, 0.18) 0%, transparent 55%), radial-gradient(ellipse at 50% 50%, rgba(11, 18, 50, 0.4) 0%, transparent 70%)'
    : `radial-gradient(ellipse at 50% 0%, ${kingdom.color}28 0%, transparent 55%), radial-gradient(ellipse at 50% 100%, ${kingdom.color}18 0%, transparent 65%)`

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse at 50% 45%, #0c1232 0%, #07091e 50%, #030414 100%)',
      overflow: 'hidden',
    }}>
      <BrassDefs />

      <Stars count={260} seed={4} opacity={0.85} milky />
      <Stars count={48} seed={17} opacity={0.55} />
      {isMiveritas
        ? <Aurora variant="miveritas" intensity={0.7} />
        : <Aurora variant="dense" intensity={0.45} />}
      <NebulaBackdrop />
      <Motes count={22} color="#fde4a0" />
      <div className="grain-dark" style={{ opacity: 0.18 }} />
      <div style={{ position: 'absolute', inset: 0, background: surfaceGlow, pointerEvents: 'none' }} />

      <button onClick={handleBack} className="k-back" style={{
        all: 'unset', position: 'absolute', left: 28, top: 26, zIndex: 60,
        display: 'inline-flex', alignItems: 'center', gap: 10,
        fontFamily: "'Cormorant Garamond', serif", fontSize: 15,
        color: 'rgba(247, 236, 207, 0.92)', cursor: 'pointer',
        padding: '8px 14px 8px 10px',
        background: 'rgba(7, 9, 30, 0.55)',
        border: '1px solid rgba(200, 156, 90, 0.35)',
        borderRadius: 999, backdropFilter: 'blur(10px)',
        transition: 'all 220ms ease',
      }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(200, 156, 90, 0.15)'
          e.currentTarget.style.borderColor = 'rgba(200, 156, 90, 0.6)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(7, 9, 30, 0.55)'
          e.currentTarget.style.borderColor = 'rgba(200, 156, 90, 0.35)'
        }}>
        <span style={{ fontSize: 20, lineHeight: 0.7 }}>←</span>
        <span style={{ fontStyle: 'italic' }}>the astrolabe</span>
      </button>

      <div className="k-split" style={{
        position: 'absolute', inset: 0, zIndex: 5,
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 0,
      }}>
        <div className="k-planet-side" style={{
          position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 32, minHeight: 0,
          animation: 'planet-arrive 700ms cubic-bezier(0.22, 0.84, 0.36, 1) backwards',
        }}>
          <RotatingPlanet kingdom={kingdom} isMiveritas={isMiveritas} />
        </div>

        <div className="k-info-side" style={{
          position: 'relative', display: 'flex', flexDirection: 'column',
          padding: '72px 7% 96px 16px', minHeight: 0,
          animation: 'info-arrive 640ms cubic-bezier(0.22, 0.84, 0.36, 1) 120ms backwards',
        }}>
          <div className="smallcaps" style={{
            fontSize: 10, letterSpacing: '0.42em',
            color: isMiveritas ? 'rgba(122, 223, 226, 0.85)' : 'rgba(200, 156, 90, 0.8)',
          }}>
            ✦  {kingdom.verb}  ✦
          </div>
          <div className="serif" style={{
            marginTop: 8, fontSize: 'clamp(40px, 5.4vw, 84px)', lineHeight: 1,
            fontStyle: 'italic', fontWeight: 400, color: 'rgba(247, 236, 207, 0.95)',
          }}>{kingdom.serif}</div>
          <div className="serif" style={{
            marginTop: 14, fontSize: 15, fontStyle: 'italic', lineHeight: 1.55,
            color: 'rgba(243, 236, 217, 0.7)', maxWidth: 480,
          }}>“{kingdom.proverb}”</div>

          <div className="k-controls" style={{ marginTop: 22, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <ViewToggle view={view} setView={setView} kingdom={kingdom} isMiveritas={isMiveritas} />
            {isMiveritas && <PerspectiveToggle perspective={perspective} setPerspective={setPerspective} myName={myName} partnerName={partnerName} />}
          </div>

          <div style={{
            marginTop: 18, flex: 1, minHeight: 0,
            display: 'flex', flexDirection: 'column',
          }}>
            <BrassFrame>
              <div className="no-scrollbar" style={{
                flex: 1, overflowY: 'auto',
                padding: view === 'starlog' ? '20px 24px 24px' : '18px 16px 24px',
              }}>
                {view === 'starlog'
                  ? (isMiveritas
                    ? <MiveritasStarlog deeds={deeds} perspective={perspective} onSeal={sealVeritas} myName={myName} partnerName={partnerName} />
                    : (deeds.length === 0
                      ? <EmptyKingdom kingdom={kingdom} />
                      : <Starlog deeds={deeds} kingdom={kingdom} onSeal={sealDeed} onUnseal={unsealDeed} />))
                  : (isMiveritas
                    ? <MiveritasTarot deeds={deeds} perspective={perspective} onSeal={sealVeritas} myName={myName} partnerName={partnerName} />
                    : (deeds.length === 0
                      ? <EmptyKingdom kingdom={kingdom} />
                      : <Tarot deeds={deeds} kingdom={kingdom} onSeal={sealDeed} onUnseal={unsealDeed} />))}
              </div>

              <div style={{
                position: 'relative', padding: '12px 22px 14px',
                borderTop: '1px solid rgba(200, 156, 90, 0.18)',
                background: 'linear-gradient(180deg, transparent, rgba(11, 18, 50, 0.35))',
              }}>
                {!adding ? (
                  <button onClick={() => setAdding(true)} style={{
                    all: 'unset', width: '100%', cursor: 'pointer',
                    color: 'rgba(243, 236, 217, 0.55)',
                    fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 15,
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <PlusSocket color={isMiveritas ? '#7adfe2' : kingdom.color} />
                    {placeholderFor(id)}
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <PlusSocket color={isMiveritas ? '#7adfe2' : kingdom.color} />
                      <input
                        autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !showNote) addDeed()
                          if (e.key === 'Escape') {
                            setAdding(false); setDraft(''); setDraftNote(''); setShowNote(false)
                          }
                        }}
                        placeholder={placeholderFor(id)}
                        style={{
                          all: 'unset', flex: 1,
                          fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 16,
                          color: 'var(--ink)',
                        }} />
                      <button onClick={addDeed} disabled={!draft.trim()} style={{
                        all: 'unset', cursor: draft.trim() ? 'pointer' : 'not-allowed',
                        padding: '6px 14px', borderRadius: 999,
                        background: !draft.trim() ? 'rgba(200, 156, 90, 0.12)' : isMiveritas
                          ? 'linear-gradient(90deg, var(--k-veritas-a), var(--k-veritas-b))'
                          : `linear-gradient(90deg, ${kingdom.color}, ${darken(kingdom.color, 0.2)})`,
                        color: !draft.trim() ? 'rgba(243, 236, 217, 0.4)' : '#1a1208',
                        fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 13,
                        transition: 'all 200ms ease',
                      }}>enter</button>
                    </div>
                    {showNote && (
                      <div style={{ paddingLeft: 40, animation: 'stagger-in 200ms ease-out backwards' }}>
                        <textarea
                          autoFocus value={draftNote} onChange={(e) => setDraftNote(e.target.value)}
                          placeholder="a small note, soft and private…"
                          rows={2}
                          style={{
                            all: 'unset', display: 'block', width: 'calc(100% - 60px)',
                            fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 13,
                            color: 'rgba(243, 236, 217, 0.8)', lineHeight: 1.5,
                            paddingTop: 6, paddingBottom: 6,
                            borderTop: '1px dashed rgba(200, 156, 90, 0.18)',
                          }} />
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingLeft: 40, fontSize: 10 }}>
                      <button onClick={() => setShowNote(s => !s)} style={{
                        all: 'unset', cursor: 'pointer',
                        fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: '0.22em',
                        color: showNote ? 'rgba(253, 228, 160, 0.9)' : 'rgba(200, 156, 90, 0.6)',
                        textTransform: 'uppercase',
                      }}>{showNote ? '✕ HIDE NOTE' : '+ ADD NOTE'}</button>
                      {!isMiveritas && (
                        <>
                          <div style={{ width: 1, height: 10, background: 'rgba(200, 156, 90, 0.2)' }} />
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <span className="mono" style={{ fontSize: 8, letterSpacing: '0.22em', color: 'rgba(200, 156, 90, 0.55)' }}>WHO:</span>
                            {[myName, partnerName].map(name => (
                              <button key={name} onClick={() => setWho(name)} style={{
                                all: 'unset', cursor: 'pointer',
                                padding: '2px 8px', borderRadius: 999,
                                fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 11,
                                color: who === name ? '#0c0f24' : 'rgba(243, 236, 217, 0.55)',
                                background: who === name ? kingdom.color : 'transparent',
                                border: who === name ? 'none' : '1px solid rgba(200, 156, 90, 0.2)',
                                transition: 'all 200ms ease',
                              }}>{name.toLowerCase()}</button>
                            ))}
                          </div>
                        </>
                      )}
                      <div style={{ marginLeft: 'auto' }}>
                        <button onClick={() => {
                          setAdding(false); setDraft(''); setDraftNote(''); setShowNote(false)
                        }} style={{
                          all: 'unset', cursor: 'pointer',
                          fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: '0.22em',
                          color: 'rgba(200, 156, 90, 0.55)',
                          textTransform: 'uppercase',
                        }}>ESC</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </BrassFrame>
          </div>
        </div>
      </div>

      <KingdomFooter deeds={deeds} kingdom={kingdom} isMiveritas={isMiveritas} />
    </div>
  )
}

function PlusSocket({ color }) {
  return (
    <span style={{
      flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
      border: `1px dashed ${color}aa`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      color, fontSize: 16, fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
      background: 'rgba(11, 18, 50, 0.4)',
    }}>＋</span>
  )
}

function BrassFrame({ children }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      position: 'relative',
      background: 'linear-gradient(180deg, rgba(11, 18, 50, 0.5), rgba(7, 9, 30, 0.62))',
      border: '1px solid rgba(200, 156, 90, 0.28)',
      borderRadius: 4,
      boxShadow: 'inset 0 0 60px rgba(122, 223, 226, 0.05), 0 20px 60px rgba(0, 0, 0, 0.55)',
      overflow: 'hidden',
    }}>
      <BrassCorner pos="tl" />
      <BrassCorner pos="tr" />
      <BrassCorner pos="bl" />
      <BrassCorner pos="br" />
      {children}
    </div>
  )
}

function BrassCorner({ pos }) {
  const [v, h] = pos.split('')
  const style = { position: 'absolute', width: 28, height: 28, pointerEvents: 'none', zIndex: 2, opacity: 0.7 }
  if (v === 't') style.top = 6
  else style.bottom = 6
  if (h === 'l') style.left = 6
  else style.right = 6
  const sx = h === 'l' ? 1 : -1
  const sy = v === 't' ? 1 : -1
  return (
    <svg viewBox="0 0 28 28" style={{ ...style, transform: `scale(${sx}, ${sy})` }}>
      <g stroke="#c89c5a" fill="none" strokeWidth="0.7" strokeLinecap="round">
        <path d="M 4 4 L 4 14 M 4 4 L 14 4" />
        <path d="M 8 4 Q 12 6, 14 8" />
        <circle cx="6" cy="6" r="1.5" fill="#c89c5a" stroke="none" />
      </g>
    </svg>
  )
}

function EmptyKingdom({ kingdom }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100%', minHeight: 220, padding: 24, textAlign: 'center', gap: 16,
    }}>
      <div className="serif" style={{
        fontSize: 22, fontStyle: 'italic',
        color: 'rgba(247, 236, 207, 0.78)', lineHeight: 1.3,
      }}>
        No deeds yet in {kingdom.serif}.
      </div>
      <div className="serif" style={{
        fontSize: 14, fontStyle: 'italic',
        color: 'rgba(243, 236, 217, 0.5)', maxWidth: 340, lineHeight: 1.5,
      }}>
        ride softly. press only what you mean.
        <br />the first deed is always the smallest.
      </div>
    </div>
  )
}

function KingdomFooter({ deeds, kingdom, isMiveritas }) {
  const total = deeds.length
  let sealed = 0
  if (isMiveritas) {
    sealed = deeds.filter(d => d.sealedBy?.elsa && d.sealedBy?.granny).length
  } else {
    sealed = deeds.filter(d => d.sealed).length
  }
  const c = isMiveritas ? 'var(--k-veritas-a)' : kingdom.color
  return (
    <div className="k-footer" style={{
      position: 'absolute', left: '7%', right: '7%', bottom: 22,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      pointerEvents: 'none', zIndex: 6,
    }}>
      <div className="mono" style={{ fontSize: 9, color: 'rgba(200, 156, 90, 0.7)', letterSpacing: '0.26em' }}>
        {String(sealed).padStart(2, '0')} / {String(total).padStart(2, '0')}  SEALED
      </div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            width: 22, height: 3, borderRadius: 2,
            background: i < sealed ? c : 'rgba(243, 236, 217, 0.12)',
            transition: 'background 280ms ease',
          }} />
        ))}
      </div>
      <div className="serif k-footer-tagline" style={{ fontSize: 12, fontStyle: 'italic', color: 'rgba(243, 236, 217, 0.55)' }}>
        {isMiveritas ? 'a deed here waits for two seals.' : 'press only what you mean.'}
      </div>
    </div>
  )
}
