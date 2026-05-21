import { KINGDOM_COLORS } from '../lib/constants.js'

const KINGDOM_POSITIONS = {
  Miamas:    { cx: 200, cy: 180 },
  Miploris:  { cx: 750, cy: 160 },
  Mirevas:   { cx: 120, cy: 480 },
  Miaudacas: { cx: 500, cy: 350 },
  Mimovas:   { cx: 830, cy: 450 },
  Mibatolos: { cx: 420, cy: 580 },
}

const RADIUS = 80

export function WorldMapSVG({ kingdoms, onKingdomClick }) {
  return (
    <svg
      viewBox="0 0 1000 700"
      className="w-full h-full"
      style={{ filter: 'drop-shadow(0 0 40px rgba(0,0,0,0.8))' }}
    >
      <rect width="1000" height="700" fill="#1a1208" />

      {/* Parchment texture overlay using SVG filter */}
      <defs>
        <filter id="parchment">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" result="noise" />
          <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
          <feBlend in="SourceGraphic" in2="grayNoise" mode="multiply" result="blended" />
          <feComposite in="blended" in2="SourceGraphic" operator="in" />
        </filter>
        <filter id="noise">
          <feTurbulence type="turbulence" baseFrequency="0.9" numOctaves="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
        </filter>
      </defs>
      <rect width="1000" height="700" fill="#2a1f0d" opacity="0.4" filter="url(#parchment)" />

      {/* Decorative paths between kingdoms */}
      <g stroke="#3a2a10" strokeWidth="2" strokeDasharray="8,6" fill="none" opacity="0.5">
        <line x1="200" y1="180" x2="500" y2="350" />
        <line x1="750" y1="160" x2="500" y2="350" />
        <line x1="500" y1="350" x2="120" y2="480" />
        <line x1="500" y1="350" x2="830" y2="450" />
        <line x1="500" y1="350" x2="420" y2="580" />
      </g>

      {kingdoms.map((kingdom) => {
        const pos = KINGDOM_POSITIONS[kingdom.name]
        if (!pos) return null
        const colors = KINGDOM_COLORS[kingdom.name]
        const isLocked = kingdom.status === 'locked'
        const isActive = kingdom.status === 'active'
        const isCompleted = kingdom.status === 'completed'

        return (
          <g
            key={kingdom.id}
            transform={`translate(${pos.cx}, ${pos.cy})`}
            onClick={() => !isLocked && onKingdomClick(kingdom)}
            style={{ cursor: isLocked ? 'default' : 'pointer' }}
          >
            {isActive && (
              <circle
                r={RADIUS + 20}
                fill={colors.glow}
                opacity="0.15"
                className="animate-pulse"
              />
            )}

            <circle
              r={RADIUS}
              fill={isLocked ? '#2a2018' : colors.accent}
              stroke={isLocked ? '#3a2a10' : colors.glow}
              strokeWidth={isActive ? 3 : 1.5}
              opacity={isLocked ? 0.4 : 1}
            />

            <text
              textAnchor="middle"
              dy="0.35em"
              fill={isLocked ? '#5a4a30' : '#f0e8d0'}
              fontSize="14"
              fontFamily="Georgia, serif"
              fontWeight={isActive ? 'bold' : 'normal'}
            >
              {kingdom.name}
            </text>

            {isLocked && (
              <text textAnchor="middle" dy="20" fontSize="18" fill="#5a4a30">
                🔒
              </text>
            )}

            {isCompleted && (
              <text textAnchor="middle" dy="20" fontSize="18" fill={colors.glow}>
                ✦
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
