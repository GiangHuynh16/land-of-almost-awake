import { useEffect, useMemo, useState } from 'react'

export function Aurora({ variant = 'default', intensity = 1, style = {} }) {
  const layers = variant === 'miveritas'
    ? [
        { color: 'rgba(122, 223, 226, 0.40)', anim: 'aurora-a 26s ease-in-out infinite', top: '-30%', left: '-20%', w: '120%', h: '70%' },
        { color: 'rgba(228, 137, 200, 0.35)', anim: 'aurora-b 32s ease-in-out infinite', top: '10%', left: '-10%', w: '110%', h: '70%' },
        { color: 'rgba(122, 223, 226, 0.18)', anim: 'aurora-c 38s ease-in-out infinite', top: '30%', left: '-30%', w: '140%', h: '70%' },
      ]
    : variant === 'dense'
    ? [
        { color: 'rgba(246, 205, 191, 0.35)', anim: 'aurora-a 28s ease-in-out infinite', top: '-30%', left: '-20%', w: '120%', h: '75%' },
        { color: 'rgba(184, 168, 228, 0.30)', anim: 'aurora-b 34s ease-in-out infinite', top: '-10%', left: '-10%', w: '110%', h: '70%' },
        { color: 'rgba(122, 223, 226, 0.25)', anim: 'aurora-c 38s ease-in-out infinite', top: '5%', left: '-30%', w: '140%', h: '70%' },
        { color: 'rgba(228, 137, 200, 0.20)', anim: 'aurora-a 30s ease-in-out -8s infinite', top: '20%', left: '-20%', w: '130%', h: '60%' },
        { color: 'rgba(158, 212, 181, 0.18)', anim: 'aurora-b 44s ease-in-out -12s infinite', top: '40%', left: '-30%', w: '140%', h: '65%' },
      ]
    : [
        { color: 'rgba(246, 205, 191, 0.25)', anim: 'aurora-a 32s ease-in-out infinite', top: '-25%', left: '-20%', w: '120%', h: '60%' },
        { color: 'rgba(184, 168, 228, 0.22)', anim: 'aurora-b 38s ease-in-out infinite', top: '-15%', left: '-10%', w: '110%', h: '55%' },
        { color: 'rgba(158, 212, 181, 0.16)', anim: 'aurora-c 44s ease-in-out infinite', top: '5%', left: '-30%', w: '140%', h: '60%' },
      ]

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', ...style }}>
      {layers.map((l, i) => (
        <div key={i} style={{
          position: 'absolute', top: l.top, left: l.left, width: l.w, height: l.h,
          background: `radial-gradient(ellipse at center, ${l.color} 0%, transparent 65%)`,
          // Reduced blur radius (50→32px) — at 50px the rasterizer cost on real GPUs
          // dominated compositing during camera moves. 32px reads the same at this opacity.
          filter: 'blur(32px)',
          animation: l.anim,
          opacity: intensity,
        }} />
      ))}
    </div>
  )
}

export function Stars({ count = 80, seed = 1, opacity = 1, milky = false }) {
  const stars = useMemo(() => {
    let s = seed * 9301
    const rng = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
    return Array.from({ length: count }, () => {
      const inMilky = milky && rng() < 0.6
      const x = inMilky ? 30 + rng() * 40 : rng() * 100
      const y = inMilky ? 20 + rng() * 60 : rng() * 100
      return {
        x, y,
        r: rng() * 1.4 + 0.3,
        a: rng() * 0.7 + 0.2,
        d: rng() * 6 + 4,
        delay: rng() * 6,
        warm: rng() > 0.7,
      }
    })
  }, [count, seed, milky])
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none' }}>
      {stars.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.r * 0.16} fill={p.warm ? '#fdf2d9' : '#e8edff'}
          style={{ opacity: p.a, animation: `twinkle ${p.d}s ease-in-out ${p.delay}s infinite` }} />
      ))}
    </svg>
  )
}

export function Motes({ count = 30, color = '#fdf2d9', area = 'full' }) {
  const motes = useMemo(() => {
    let s = 7
    const rng = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
    return Array.from({ length: count }, () => ({
      x: rng() * 100,
      y: area === 'bottom' ? 60 + rng() * 40 : rng() * 100,
      d: 8 + rng() * 14,
      delay: rng() * 8,
      size: 1 + rng() * 2.2,
    }))
  }, [count, area])
  // CSS-transform animation instead of SMIL `<animate>` — composited on the GPU
  // (zero layout/paint per frame). Each mote is its own absolutely-positioned dot
  // so `translateY` is cheap; the previous SVG approach made the browser repaint
  // the whole `<svg>` viewport every tick.
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {motes.map((m, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${m.x}%`, top: `${m.y}%`,
          width: `${m.size * 1.6}px`, height: `${m.size * 1.6}px`,
          borderRadius: '50%',
          background: color,
          opacity: 0,
          animation: `mote-rise ${m.d}s ease-in-out ${m.delay}s infinite`,
        }} />
      ))}
    </div>
  )
}

export function BrassRing({ cx, cy, r, color = '#c89c5a', strokeWidth = 0.6, ticks = 36, opacity = 0.7, dashed = false }) {
  const tickArr = Array.from({ length: ticks })
  return (
    <g opacity={opacity}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={dashed ? '2 2' : undefined} />
      {tickArr.map((_, i) => {
        const a = (i / ticks) * Math.PI * 2
        const isMajor = i % 6 === 0
        const t = isMajor ? 5 : 2.5
        const x1 = cx + Math.cos(a) * (r - t)
        const y1 = cy + Math.sin(a) * (r - t)
        const x2 = cx + Math.cos(a) * r
        const y2 = cy + Math.sin(a) * r
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={isMajor ? strokeWidth * 1.8 : strokeWidth * 0.9} />
      })}
    </g>
  )
}

export function NebulaBackdrop({ tint = 'default', brightness = 1 }) {
  const palettes = {
    default: ['rgba(138, 90, 200, 0.28)', 'rgba(60, 180, 220, 0.22)', 'rgba(236, 128, 158, 0.16)'],
    warm: ['rgba(232, 144, 96, 0.26)', 'rgba(228, 137, 200, 0.20)', 'rgba(252, 198, 110, 0.18)'],
    violet: ['rgba(160, 100, 220, 0.30)', 'rgba(120, 90, 200, 0.22)', 'rgba(80, 60, 180, 0.18)'],
    deep: ['rgba(80, 60, 180, 0.20)', 'rgba(50, 100, 160, 0.16)', 'rgba(40, 50, 120, 0.14)'],
    cyan: ['rgba(122, 223, 226, 0.26)', 'rgba(60, 180, 220, 0.22)', 'rgba(160, 220, 240, 0.18)'],
    pale: ['rgba(180, 200, 230, 0.22)', 'rgba(220, 200, 200, 0.18)', 'rgba(160, 180, 220, 0.16)'],
  }
  const c = palettes[tint] || palettes.default
  // Blur radii cut (50/50/60 → 32/32/36) — large blurs are the dominant compositor cost
  // on real-device GPUs; at these opacities the visual difference is imperceptible.
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', opacity: brightness, transition: 'opacity 900ms ease' }}>
      <div style={{
        position: 'absolute', top: '10%', left: '5%', width: '55%', height: '60%',
        background: `radial-gradient(ellipse at center, ${c[0]} 0%, transparent 60%)`,
        filter: 'blur(32px)',
        animation: 'aurora-a 32s ease-in-out infinite',
        transition: 'background 900ms ease',
      }} />
      <div style={{
        position: 'absolute', top: '20%', right: '5%', width: '55%', height: '55%',
        background: `radial-gradient(ellipse at center, ${c[1]} 0%, transparent 60%)`,
        filter: 'blur(32px)',
        animation: 'aurora-b 36s ease-in-out infinite',
        transition: 'background 900ms ease',
      }} />
      <div style={{
        position: 'absolute', top: '45%', left: '30%', width: '45%', height: '45%',
        background: `radial-gradient(ellipse at center, ${c[2]} 0%, transparent 60%)`,
        filter: 'blur(36px)',
        animation: 'aurora-c 42s ease-in-out infinite',
        transition: 'background 900ms ease',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, transparent 25%, rgba(3, 4, 20, 0.55) 75%)',
      }} />
    </div>
  )
}

export function useViewport() {
  const [vp, setVp] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 1440,
    h: typeof window !== 'undefined' ? window.innerHeight : 900,
  })
  useEffect(() => {
    const onR = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onR)
    return () => window.removeEventListener('resize', onR)
  }, [])
  return vp
}

export function BrassDefs() {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        <radialGradient id="brass-rivet" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#fde4a0" />
          <stop offset="50%" stopColor="#c89c5a" />
          <stop offset="100%" stopColor="#3a2a10" />
        </radialGradient>
        <linearGradient id="brass-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#f0d49a" />
          <stop offset="50%" stopColor="#c89c5a" />
          <stop offset="100%" stopColor="#7a5618" />
        </linearGradient>
      </defs>
    </svg>
  )
}
